import {ThreadCreateParams} from "openai/src/resources/beta/threads/threads";
import {Collection, Message, User} from "discord.js";

export default class OpenAIThreadMessageFactory {
    static fromDiscordMessages(messages: Collection<string, Message>, withDate = false): ThreadCreateParams.Message[] {
        return messages.map((message) => ({
            'role': 'user',
            'content': OpenAIThreadMessageFactory.getUserName(message.author) +
                (withDate? ' ' + message.createdAt.toLocaleString() : '') + ": " +
                message.content + (
                    message.attachments.size > 0 ? "\n" + message.attachments.map((attachment) =>
                        attachment.name + " (" + attachment.size + "bytes): " + attachment.url
                    ).join("\n") : ""
                ) + (
                message.embeds.length > 0 ? "\n" + message.embeds.map((embed) =>
                    embed.title + " (" + embed.url + ")"
                ).join("\n") : ""
            ),
        })) as ThreadCreateParams.Message[];
    }

    static getUserName(user: User) {
        return user.globalName || user.username;
    }

    static fromString(addedMessage: string) {
        return {
            'role': 'user',
            'content': addedMessage,
        } as ThreadCreateParams.Message
    }

    static forBotly(messages: Collection<string, Message>){

        return messages.map((message) => {
            return {
                id: message.id,
                content: message.content.replace(/[\n\r\s\t]+/g ,' ').replace(' | ', ' '),
                authorId: message.author.id,
                createdTimestamp: message.createdTimestamp,
                attachments: message.attachments.map((attachment) => ({
                    name: attachment.name,
                    size: attachment.size,
                    url: attachment.url,
                })),
                embeds: message.embeds.map((embed) => ({
                    title: embed.title,
                    url: embed.url,
                })),
                author : {
                    id: message.author.id,
                    username: message.author.username,
                    discriminator: message.author.discriminator,
                    avatar: message.author.avatar,
                    bot: message.author.bot,
                    system: message.author.system,
                    createdTimestamp: message.author.createdTimestamp,
                },
                reference : {
                    messageId: message.reference?.messageId ?? null,
                    channelId: message.reference?.channelId ?? null,
                    guildId: message.reference?.guildId ?? null,
                },
            }
        })
    }
}