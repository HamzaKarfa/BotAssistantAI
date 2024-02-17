import DiscordConnector from "./connectors/DiscordConnector";
import OpenAIConnector from "./connectors/OpenAIConnector";
import BotlyConnector from "./connectors/BotlyConnector";
import OpenAIThreadMessageFactory from "./factories/OpenAIThreadMessageFactory";
import DiscordMessageFactory from "./factories/DiscordMessageFactory";
import {BaseMessageOptions, Message, MessageEditOptions, Snowflake, TextBasedChannel} from "discord.js";
import ToolCallExecutor from "./executors/ToolCallExecutor";
import {debug, info} from "./utils/log";
import config from "./config";
import autoInject from "./utils/autoInject";
import AssistantRunExecutor from "./executors/AssistantRunExecutor";
import RunObserver from "./observers/RunObserver";
import OpenAIInstructionsFactory from "./factories/OpenAIInstructionsFactory";
import Tool from "./interfaces/Tool";
import * as cron from "node-cron";

export default class Bot {
  private tools: Tool[];
  constructor(private discord: DiscordConnector, private openai: OpenAIConnector, private botly: BotlyConnector) {
  }

  async init() {
    this.tools = await autoInject('tools/*.js');

    const reply = this.reply.bind(this);

    this.discord.onBotInvoked(reply);
    this.discord.onBotEmojiReaction(config.REACTION_EMOJI, reply);
    //this.discord.onBotCommand(config.COMMAND, reply);
    await this.discord.login();

    this.scheduleMorningMessage('0 9 * * 1-5');
  }

  private async reply(message: Message, channel: TextBasedChannel, addedMessage: string | null = null) {
    const botlyContext = await this.botly.getChatContext(message);

    const selectedMessages = await this.discord.getLastMessagesWithPinned(channel)

    const openAIThreadMessages = OpenAIThreadMessageFactory.fromDiscordMessages(selectedMessages)

    if (addedMessage) {
      openAIThreadMessages.push(
          OpenAIThreadMessageFactory.fromString(addedMessage)
      )
    }
    const assistant = await this.openai.createAssistantFromTemplate(config.OPENAI_API_ASSISTANT_ID!)
    const thread = await this.openai.upsertThread(openAIThreadMessages)

    const observer = new RunObserver()
    const toolCallExecutor = new ToolCallExecutor(this.tools, message)
    const runExecutor = new AssistantRunExecutor(thread, this.openai, observer, toolCallExecutor)

    let lastToolsCallMessage: Message
    let hasSentFirstMessage = false

    const replyOrSend = (original: Message, reply: BaseMessageOptions) => {
      const channel: TextBasedChannel = original.channel;

      try {
        if (hasSentFirstMessage) {
          return channel.send(reply)
        } else {
          hasSentFirstMessage = true
          return original.reply(reply)
        }
      } catch (e) {
        return channel.send(reply)
      }
    }

    observer.onToolsCall(async (toolCalls) => {
      const replyMessage = DiscordMessageFactory.fromOpenAIToolCalls(toolCalls, toolCallExecutor)

      if (!replyMessage.embeds?.length) {
        return
      }

      debug("[TOOLS CALL] replyMessage", replyMessage)

      if (lastToolsCallMessage) {
        const embeds = DiscordMessageFactory.mergeEmbeds(lastToolsCallMessage.embeds, replyMessage.embeds)
        await lastToolsCallMessage.edit({embeds} as MessageEditOptions)
      } else {
        lastToolsCallMessage = await message.reply(replyMessage)
      }
    })

    observer.onMessageContentFile(async (fileName, content) => {
      await replyOrSend(message, DiscordMessageFactory.fromOpenAIMessageContentFile(fileName, await content.arrayBuffer()))
    })

    observer.onMessageContentText(async (content) => {
      info("[MESSAGE CONTENT]", content)

      for (const replyMessage of DiscordMessageFactory.fromOpenAIMessageContentText(content)) {
        replyOrSend(message, replyMessage)
      }
    })

    observer.onRunFailed(async (run) => {
      await replyOrSend(message, {content: "Whoops ! Une erreur interne a eu lieu chez OpenAI. Merci de réessayer."})
    })

    const instructions = OpenAIInstructionsFactory.fromContext(botlyContext, message, assistant)
    const activeRunTools = toolCallExecutor.getActiveTools()
    debug("[ACTIVE TOOLS]", Object.values(activeRunTools).map((tool) => tool.definition().name))
    debug("[INSTRUCTIONS]", instructions)

    const run = await this.openai.run(assistant.id, thread, instructions, activeRunTools)
    await runExecutor.execute(run)
//await this.openai.deleteThread(thread.id)

    try {
      await this.openai.deleteAssistant(assistant.id)
    }
    catch (e) {
      console.error("Error while deleting assistant", e)
    }
  }

  private scheduleMorningMessage(schedule: string) {
    cron.schedule(schedule, async () => {
      if (!config.CHANNEL_ID) {
        console.error("CHANNEL_ID is not defined in .env file")
        return
      }
      const formats = [
        "bonjour simple",
        "bonjour dans une langue étrangère",
        "haiku",
        "poème",
        "trivia",
        "chanson courte",
        "citation",
        "proverbe",
        "devinette",
        "blague originale et unique",
        "anecdote historique",
        "fait scientifique",
      ]

      const prompt = `
            Dis bonjour à tout le monde d'une façon unique et originale. Ceci peut inclure un fait amusant, un message d'encouragement, ou une histoire courte.
            Ne mentionne pas la date au début de ton message, mais tu peux t'en servir comme inspiration.
            Le format du jour choisi aléatoirement est : ${formats[Math.floor(Math.random() * formats.length)]}.
            Tu peux également chercher des informations sur internet en rapport avec la date, le format, ou des actualités.`;

      const channel: TextBasedChannel = await this.discord.client.channels.cache.get(config.CHANNEL_ID as Snowflake) as TextBasedChannel;
      if (!channel) {
        console.error(`Le channel avec l'ID ${process.env.CHANNEL_ID} est introuvable.`);
        return;
      }

      try {
        const lastMessage = await this.discord.getLastMessages(channel, 1).then(messages => messages.first());
        if (!lastMessage) {
          console.error("Aucun message trouvé dans le channel.");
          return;
        }
        await this.reply(lastMessage, channel, prompt);
      } catch (error) {
        console.error('Une erreur est survenue lors de la récupération des messages:', error);
      }
    }, {
      timezone: "Europe/Paris"
    })
  }
}