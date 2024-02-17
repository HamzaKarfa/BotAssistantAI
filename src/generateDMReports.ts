import BotlyConnector from "./connectors/BotlyConnector";
import {debug, info} from "./utils/log";
import OpenAIThreadMessageFactory from "./factories/OpenAIThreadMessageFactory";
import DiscordConnector from "./connectors/DiscordConnector";
import config from "./config";
import {ThreadCreateParams} from "openai/src/resources/beta/threads/threads";
import OpenAIConnector from "./connectors/OpenAIConnector";
import dd from "./utils/dd";

const botly = new BotlyConnector();
const discord = new DiscordConnector(config.DISCORD_BOT_TOKEN!);
await discord.login();
const openai = new OpenAIConnector(config.OPENAI_API_KEY!);

const userIds = await botly.getUsersIdTeamsActiveMemorizeDM();

for(const userId of userIds) {
    const {messages, dmChannel } = await discord.getDmMessageOfDayByUserId(userId)
    if(messages === undefined || !messages.size) {
        info('CronJobExecutor', 'No messages found for user ' + userId)
        continue
    }
    const openAIThreadMessages = OpenAIThreadMessageFactory.fromDiscordMessages(messages, true)
    const memo = await createMementoOnDmMessage(openAIThreadMessages);
    const keywords = await extractKeywordsFromMessage(openAIThreadMessages);
    if(!memo) continue;
    const thread = {
        user_id: userId,
        resume_threads : memo,
        discord_channel_id: dmChannel.id,
        keywords : keywords.keywords
    }
    // debug('message', messages);
    const botlyMessages = OpenAIThreadMessageFactory.forBotly(messages);
    // debug('message', JSON.stringify(discordMessage).replace("\n", ' '));
    // debug('thread', thread);
    // console.log(discordMessage);
    const response = await botly.saveThread(botlyMessages, thread)
    info('Successfully saved thread', JSON.stringify(response))
    // await botly.saveMemoryOfChannel(userId, memo);
}

async function createMementoOnDmMessage(openAIThreadMessages: ThreadCreateParams.Message[]) {
    const instructions = `
            Tu es Morgan, un assistant personnel pour les stagiaires de la formation 'Like You' qui est un programme de réinsertion professionnelle pour les personnes sans emploi de longue durée.
            À partir du journal de conversation précédent, 
            Fais un rapport complet structuré de la façon suivante : 
            ## JOURNAL Daté : Contient les informations détaillées de tous les sujets qui ont été abordés rangés par date
            # UTILITé : Détermine l'utilité de Morgan du point de vue de la formation Like You
            ## CONCLUSION : Résume les points les plus importants de la conversation
            déduis les besoins réels de l'utilisateur en matière d'information.
            Essaye d'anticiper ce dont l'utilisateur a réellement besoin, 
            même s'il ne le comprend pas encore parfaitement lui-même ou 
            s'il pose les mauvaises questions.
            `
    const instructionsMessage :Array<any> = [
        { role: 'system', content: instructions },
    ]
    const messages = openAIThreadMessages.concat(instructionsMessage)
    // console.log('message', messages);
    const response = await openai.chatCompletion(messages)
    // console.log('GPT Resume', response.choices[0].message.content);
    debug('[GPT MemoDM]', 'MemoDM created');
    return response.choices[0].message.content;
}


async function extractKeywordsFromMessage (openAIThreadMessages: ThreadCreateParams.Message[]) {
    const instructions = `
            À partir du journal de conversation précédent, 
            déduis les besoins réels de l'utilisateur en matière d'information.
            Essaye d'anticiper ce dont l'utilisateur a réellement besoin, 
            même s'il ne le comprend pas encore parfaitement lui-même ou 
            s'il pose les mauvaises questions.À partir du journal de bord suivant, 
            exrtait les différents mots clés les plus importants de la conversation.
            Mettre en exergue uniquement ce qui est en rapport avec ta mission initiale
            formate ton résumé de la manière suivante :
            {
                "keywords": [
                    "keyword1",
                    "keyword2",
                ]
            }
            `
    const instructionsMessage :Array<any> = [
        { role: 'system', content: instructions },
    ]
    const messages = openAIThreadMessages.concat(instructionsMessage)
    // console.log('message', messages);
    const response = await openai.chatCompletion(messages)
    // console.log('GPT Resume', response.choices[0].message.content);
    debug('[GPT Keywords extractor]', 'keywords created');
    return JSON.parse(response.choices[0].message.content ?? '{"keywords": []}');
}

process.exit(0);