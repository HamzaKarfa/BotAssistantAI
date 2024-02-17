import {AttachmentPayload, BaseMessageOptions, Embed, EmbedData, MessagePayload, MessageReplyOptions} from "discord.js";
import {MessageContentText} from "openai/resources/beta/threads";
import ToolCallExecutor, {ToolCall} from "../executors/ToolCallExecutor.js";
import getFileExtensionByLanguage from "../utils/getFileExtensionByLanguage";

type Logs = {
    logs: string;
    type: 'logs';
}
export type DiscordEmbed = {
    title: string,
    description: string,
    footer?: {
        text: string
    },
} | EmbedData

export default class DiscordMessageFactory {
    static fromOpenAIMessageContentText(
        message: MessageContentText
    ): BaseMessageOptions[] {
        let fullContent = message.text.value.replaceAll(/\[.+?]\(sandbox:.+?\)/g, '')

        // We will now isolate the two types of blocks we can have in a message:
        // - code blocks
        // - text blocks
        // Blocks should be sent in the same order as they are in the original message.
        // Finally, we will split every text block in 2000 characters blocks.
        const blocks = fullContent.split(/(```\w*\n[\s\S]*?\n```)/g)
        const replyMessages: BaseMessageOptions[] = []

        for(const block of blocks) {
            if(block.startsWith("```")) {
                const language = block.match(/```(\w*)\n/)?.[1]
                if(block.length > 2000) {
                    replyMessages.push({
                        files: [{
                            "name": "code." + getFileExtensionByLanguage(language),
                            "attachment": Buffer.from(block
                                .replace(/```(\w*)\n/, '')
                                .replace(/```/, '')
                            )
                        }]
                    })
                }
                else {
                    replyMessages.push({
                        content: block
                    })
                }
            }
            else {
                const textBlocks = block.match(/(.|[\r\n]){1,2000}/g)
                if(textBlocks) {
                    for(const textBlock of textBlocks) {
                        if(textBlock.trim() === "") {
                            continue
                        }
                        replyMessages.push({ content: textBlock })
                    }
                }
            }
        }

        replyMessages[replyMessages.length - 1].embeds = message.text.annotations
            .filter((a) => a.type === "file_citation")
            .map(annotation => {
                return {
                    title: annotation.type,
                    description: annotation.text,
                } as Embed
            })

        return replyMessages
    }

    static fromOpenAIMessageContentFile(fileName: string, arrayBuffer: ArrayBuffer): BaseMessageOptions {
        return { files: [{
            "name": fileName,
            "attachment": Buffer.from(arrayBuffer)
        }] }
    }

    static fromOpenAIToolCalls(toolCalls: ToolCall[], toolCallExecutor: ToolCallExecutor): BaseMessageOptions {
        const disabledEmbeds = ["update_user_profile", "multi_tool_use.parallel"]

        const embeds = toolCalls.map((toolCall) => {
            if(toolCall.type === "function" && !disabledEmbeds.includes(toolCall.function.name)) {
                const toolCallFunction = toolCall.function
                return [toolCallExecutor.getEmbed(toolCallFunction)]
            }
            else if(toolCall.type === "retrieval") {
                const toolCallRetrieval = toolCall.retrieval
                console.log({toolCallRetrieval})
                // TODO: change when retrieval details will be implemented
                return [
                    {
                        description: "📂 Fichiers",
                        footer: {
                            text: "Je lis un fichier"
                        }
                    }
                ]
            }
            else if(toolCall.type === "code_interpreter") {
                if(toolCall.code_interpreter.input) {
                    return [{
                        description: "```python\n"+toolCall.code_interpreter.input+"\n```",
                    }, ...(toolCall.code_interpreter.outputs as Logs[]).map((output) => {
                        return {
                            description: "Résultat :\n```\n"+output.logs+"\n```",
                        }
                    })]
                }
                return {
                    description: "📝 Ecriture de code",
                    footer: {
                        text: "J'essaye de coder quelque chose"
                    },
                }
            }
        }).flat().filter((output) => output) as DiscordEmbed[]

        return {embeds} as BaseMessageOptions
    }

    public static mergeEmbeds(embeds: Embed[], embeds2: (Embed|any)[] | undefined): EmbedData[] {
        if(!embeds2) {
            return embeds.map((embed) => {
                return {
                    title: embed.title,
                    description: embed.description,
                    footer: embed.footer,
                } as EmbedData
            })
        }
        let mergedEmbeds: EmbedData[] = [...embeds,  ...embeds2]

        // Merged embeds with same title by concatenating their description
        const embedsMap = new Map<string, EmbedData>()
        for (const embed of mergedEmbeds) {
            if (embed.title && embedsMap.has(embed.title)) {
                const previousEmbed = embedsMap.get(embed.title)
                embedsMap.set(embed.title, {
                    ...previousEmbed,
                    ...embed,
                    // Dedupe lines
                    description: `${previousEmbed?.description || ""}\n${embed.description || ""}`
                        .split("\n")
                        .filter((line, index, self) => self.indexOf(line) === index)
                        .join("\n")
                } as EmbedData)
            } else {
                embedsMap.set(embed.title || "", embed)
            }
        }

        return [...embedsMap.values()]
    }
}