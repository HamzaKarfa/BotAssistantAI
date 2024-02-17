// src/connectors/DiscordConnector.ts
import {
    Client,
    CloseEvent,
    CommandInteraction,
    Events,
    Message,
    Partials,
    Snowflake,
    TextBasedChannel,
    SlashCommandBuilder,
    REST,
} from "discord.js";
import ErrorHandler from "../handlers/ErrorHandler.js";
import config from "../config";
import {debug, fatal, info} from "../utils/log";
import moment from "moment";
import * as Sentry from "@sentry/node";


type ReplyCallback =  (message: Message, channel: TextBasedChannel, addedMessage?: (string | null)) => Promise<void>

export default class DiscordConnector {
    public readonly client: Client;
    private readonly token: string;

    constructor(token: string) {
        this.token = token;
        this.client = new Client({
            intents: [
                "Guilds",
                "GuildMessages",
                "GuildMessageTyping",
                "GuildVoiceStates",
                "GuildScheduledEvents",
                "GuildMessageReactions",
                "DirectMessages",
                "DirectMessageTyping",
                "DirectMessageReactions",
                "MessageContent",
                "GuildMessageReactions",
                "DirectMessageReactions",
            ],
            partials: [Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User, Partials.Reaction]
        });

        this.client.on('ready', () => {
            // Scopes required:
            // bot: Send Messages, Attach Files, Use Slash Commands
            info("Use this link to add the bot to your server!");
            info(`https://discord.com/api/oauth2/authorize?client_id=${config.DISCORD_BOT_CLIENT_ID}&permissions=517547220032&scope=bot`);
            info('Discord bot is ready');
            
            console.log()
        });

        const errorHandler = (e: Error | CloseEvent) => {
            ErrorHandler.handle(e)
            this.login()
        }

        this.client.on(Events.ShardDisconnect, errorHandler);
        this.client.on(Events.ShardError, errorHandler);
        this.client.on(Events.Error, errorHandler);
    }

    async login() {
        await this.client.login(this.token);
    }

    onBotInvoked(callback: ReplyCallback) {
        this.client.on('messageCreate', async (message) => {
            if (message.author.bot) return;
            if(!message.channel.isTextBased()) return;
            if (message.content.includes("@here") || message.content.includes("@everyone")) return;

            const channel = message.channel as TextBasedChannel
            const isDM = channel.isDMBased();
            const hasBeenMentioned = message.mentions.has(this.client.user!.id);

            if (!isDM && !hasBeenMentioned) {
                return;
            }

            channel.sendTyping();
            let typingInterval = setInterval(() => {
                // @ts-ignore
                channel.sendTyping();
            }, 9500);

            try {
                await callback(message, channel)
            } catch (e: Error|any) {
                let errorMessage;
                fatal("Error while executing bot callback: " + e.message + "\n" + e.stack)
                if(config.NODE_ENV === 'production') {
                    errorMessage = "Une erreur interne est survenue, le support a été notifié."
                    Sentry.captureException(new Error(), {originalException: e})
                }
                else {
                    errorMessage = "Une erreur est survenue : " + e.message + "\n" + e.stack + "\n"
                }
                await message.reply(errorMessage)
            }
            finally {
                clearInterval(typingInterval);
            }
        })
    }

    async getLastMessages(channel: TextBasedChannel, limit: number) {
        const previousMessagesCollection = await channel.messages.fetch({limit});
        return previousMessagesCollection.reverse();
    }

    async getPinnedMessages(channel: TextBasedChannel) {
        const pinnedMessages = await channel.messages.fetchPinned();
        return pinnedMessages.filter(m => m.content).reverse()
    }

    // limit correspond au nombre de message que le bot recupere (pour avoir un contexte de la conversation)
    async getLastMessagesWithPinned(channel: TextBasedChannel, limit?: number) {
        if(!limit) {
            limit = config.DISCORD_MESSAGES_LIMIT
        }
        const pinnedMessagesCollection = await this.getPinnedMessages(channel)
        const previousMessagesCollection = await this.getLastMessages(channel, limit)

        const pinnedWithoutPrevious = pinnedMessagesCollection.subtract(previousMessagesCollection)
        const selectedMessages = pinnedWithoutPrevious.concat(previousMessagesCollection)

        //dd({
        //    selected: selectedMessages.map((message) => message.content)
        //})

        while(selectedMessages.size > 31) {
            selectedMessages.find((message) => !message.pinned)?.delete()
        }

        return selectedMessages
    }


    async getDmMessageOfDayByUserId(userId: Snowflake) {
        const dmChannel = await this.client.users.createDM(userId)
        const messages = await dmChannel.messages.fetch({limit: 100})
        //dd(messages.map((message) => message.author.name + ": "  + message.content))
        const mesagesOfDay = messages.filter((message) => {
            return true
            // Keeps messages that are form less than 24h ago
            return moment().subtract(1, 'days').isBefore(message.createdAt)
        })
        return {messages: mesagesOfDay, dmChannel}
    }

    onBotEmojiReaction(emojiCode: string, reply: ReplyCallback) {
        this.client.on('messageReactionAdd', async (reaction, user) => {
            if (reaction.emoji.name !== emojiCode) return;
            if (!reaction.message.channel.isTextBased()) return;

            debug("Reaction detected : " + reaction.emoji.name)

            const message = await reaction.message.fetch();
            const channel = message.channel as TextBasedChannel;
            await reply(message, channel);
        });
    }

    // onBotCommand(command: string, reply: ReplyCallback) {
    //     debug("Registering command " + command)
    //     this.client.application!.commands.set([{
    //         name: command,
    //         description: 'Invoquer le bot avec une instruction',
    //         options: [
    //             {
    //                 name: 'instruction',
    //                 type: 'STRING',
    //                 description: 'L\'instruction à envoyer au bot',
    //                 required: true,
    //             },
    //         ],
    //         dmPermission: true,
    //         type: 'CHAT_INPUT'
    //     }]).then((result) => {
    //         info("Commande " + command + " enregistrée")
    //         debug(result)
    //     }).catch((e) => {
    //         fatal("Erreur lors de l'enregistrement de la commande " + command + " : " + e.message + "\n" + e.stack)
    //     });
    //
    //     this.client.on('interactionCreate', async (interaction: CommandInteraction) => {
    //         if (!interaction.isCommand()) return;
    //
    //         if (interaction.commandName === command) {
    //             const channel = interaction.channel as TextBasedChannel;
    //             const lastMessage = await this.getLastMessages(channel, 1).then(messages => messages.first());
    //             // get the command input as instructions
    //             const options = interaction.options as CommandInteraction
    //             const instructions = options.getString('prompt') || '';
    //
    //             await reply(lastMessage, channel, instructions);
    //         }
    //     });
    //
    // }
}