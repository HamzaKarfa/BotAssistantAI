import { ChannelType, Message, VoiceChannel } from "discord.js";
import ffmpeg  from "fluent-ffmpeg";
import { debug, error } from "../../utils/log";
import { VoiceConnection, joinVoiceChannel } from "@discordjs/voice";




export class Helper {

    public static voiceConnection: VoiceConnection;

    /**
     * Recherche un channel vocal sur le serveur
     * @param messageContext Contexte du message
     */
    static async searchVocalChannel(messageContext: Message<boolean>) :Promise<VoiceChannel>
    {
        const channels = await messageContext?.guild?.channels.fetch()
        if (!channels) throw new Error("No vocal channels found");
        return channels.filter((channel) => channel && channel.type === ChannelType.GuildVoice)
                       .first() as VoiceChannel;
    }


    /**
     * Crée une connection au channel vocal
     * @param channel Channel vocal
     */
    static createVoiceConnection(channel: VoiceChannel)
    {
        this.voiceConnection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator // Should be referring to the correct client
        });
        return this.voiceConnection;
    }


    /**
     * Convertit un fichier PCM en WebM frequence 48000 et 2 canaux audio
     * @param inputFilePath Chemin du fichier d'entrée
     * @param outputFilePath Chemin du fichier de sortie
     */
    static async convertPCMToWebM(inputFilePath :string, outputFilePath :string) :Promise<void>
    {
        ffmpeg(inputFilePath)
            .inputFormat('s32le') 
            .audioCodec('libopus') 
            .audioChannels(2)
            .audioFrequency(48000)
            .output(outputFilePath)
            .outputFormat('webm')
            .on('end', () => debug('Conversion terminée.'))
            .on('error', (err :Error) => error('Erreur lors de la conversion : ' + err.message))
            .run();
    }
}