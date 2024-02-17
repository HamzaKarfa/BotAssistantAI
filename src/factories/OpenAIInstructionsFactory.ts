import {BotlyContext} from "../connectors/BotlyConnector";
import {Message, TextBasedChannel} from "discord.js";
import {Assistant} from "openai/resources/beta";
import OpenAIThreadMessageFactory from "./OpenAIThreadMessageFactory";

export default class OpenAIInstructionsFactory {
    static fromContext(botlyContext: BotlyContext, discordContext: Message, assistant: Assistant) {
        const channel: TextBasedChannel = discordContext.channel
        const discordChannelName = channel.isDMBased() ? 'DM' : channel.name
        const guildName = channel.isDMBased() ? 'DM' : channel.guild.name
        const authorName = OpenAIThreadMessageFactory.getUserName(discordContext.author)
        return [
            (botlyContext.prompts.guild || assistant.instructions),
            (botlyContext.prompts.channel ? 'Instructions du Salon ( Channel discord ):\n' + botlyContext.prompts.channel : ''),
            (botlyContext.prompts.user ?
                'Profil de l\'utilisateur ' + authorName + ':\n' + botlyContext.prompts.user + (
                        botlyContext.prompts.user.length < 500 ? 'L\'assistant IA est invité à compléter le profil un en utilisant le tool `update_user_profile`.' : ''
                ) :
                'Il n\'a aucun profil utilisateur enregistré pour ' + authorName + '. ' +
                'La priorité de l\'assistant IA est de créer un profil utilisateur en utilisant le tool `update_user_profile`. Pour ça il faut poser des questions à l\'utilisateur.'
            ),
            'Il est important de construire et maintenir un profil utilisateur complet et précis pour apporter une assistance efficace.',
            (channel.isDMBased() ? 'Cette discussion est privée ( DM )' :
                    'Serveur Discord actuel: ' + guildName + '\n' +
                    'Salon ( Channel discord ) actuel: ' + discordChannelName
            ),
            'Nous sommes le ' + new Date().toLocaleDateString('fr-FR') +
            ' et il est ' + new Date().toLocaleTimeString('fr-FR')
        ].filter(v=>v).join('\n\n#######\n\n')
    }
}