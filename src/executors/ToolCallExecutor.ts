import {CodeToolCall, FunctionToolCall, RetrievalToolCall} from "openai/resources/beta/threads/runs";
import Tool from "../interfaces/Tool.js";
import ContextAwareTool from "../interfaces/ContextAwareTool";
import {debug, fatal, info} from "../utils/log";
import config from "../config";
import {EmbedData, Message} from "discord.js";
import * as Sentry from "@sentry/node";
import OpenAIConnector from "../connectors/OpenAIConnector";

export type ToolCall = CodeToolCall | RetrievalToolCall | FunctionToolCall
export type ToolsCollection = { [toolName: string]: Tool | ContextAwareTool }

export default class ToolCallExecutor {
    private readonly identifiedToolCallsById: { [key: string]: boolean } = {};
    private readonly activeTools: ToolsCollection = {};

    constructor(tools: Tool[], discordContext: Message) {
        for (const tool of tools) {
            if (tool instanceof ContextAwareTool) {
                tool.setDiscordContext(discordContext)
            }

            const isToolEnabled = config.BOT_ENABLED_TOOLS.includes('*') || config.BOT_ENABLED_TOOLS.includes(tool.definition().name)
            const isToolDisabled = config.BOT_DISABLED_TOOLS.includes(tool.definition().name)

            if (isToolEnabled && !isToolDisabled) {
                this.activeTools[tool.definition().name] = tool
            }
        }
    }

    execute(functionToolCalls: FunctionToolCall[]) {
        const handlers = functionToolCalls.map(async (toolCall) => {
            this.identifiedToolCallsById[toolCall.id] = true
            const tool = this.getTool(toolCall.function)

            info("[TOOL CALL] " + toolCall.function.name + " : " + toolCall.function.arguments)

            let output: string;
            try {
                output = await tool.handle(this.parseArguments(toolCall.function.arguments))
            } catch (e: any) {
                if (config.NODE_ENV === 'production') {
                    output = "An error occured while executing the tool " + toolCall.function.name + ". Tell the user the support team has been notified."
                } else {
                    output = "An error occured while executing the tool " + toolCall.function.name + " : " + e.message + "\n" + e.stack + "\n" +
                        "The user is a developer and this is a development environment, so you can give him a detailed error message."
                }
                fatal("Error while executing tool " + toolCall.function.name + " : " + e.message + "\n" + e.stack)
                // Send error to sentry
                Sentry.captureException(new Error(), {originalException: e})
            }

            info("[TOOL OUTPUT] " + toolCall.function.name + " : " + output)

            return {
                tool_call_id: toolCall.id,
                output
            }
        })

        return Promise.all(handlers)
    }

    getEmbed(toolCallFunction: FunctionToolCall.Function): EmbedData {
        try {
            let embed = this.getTool(toolCallFunction).getEmbed(this.parseArguments(toolCallFunction.arguments));
            if (!embed.description) {
                embed.description = '';
            }
            return embed;
        } catch (e: any) {
            fatal("Error while getting embed for tool " + toolCallFunction.name + " : " + e.message + "\n" + e.stack)
            config.NODE_ENV === "production" && Sentry.captureException(e)
            return {}
        }
    }

    /**
     * Supposed to be natively working since 25/01/2024
     * @param json
     * @private
     */
    private parseArguments(json: string): { [key: string]: any } {

        return JSON.parse(json || "{}")

        //const systemMessage = "Here is a potentially invalid or wrongly encoded JSON, you job is to fix this " +
        //    "JSON and its encoding if needed. It needs to be compatible with English and French : " + "\n\n##############\n\n" + json;
//
        //try {
        //    const messageCheck = await this.openai.getChatCompletion(systemMessage);
        //    return JSON.parse(messageCheck || "{}")
//
        //} catch (error) {
        //    fatal("Error while double checking json: ", error);
        //    throw error;
        //}
    }

    private getTool(toolCallFunction: FunctionToolCall.Function) {
        const tool = this.activeTools[toolCallFunction.name]
        if (!tool) {
            fatal(`Tool ${toolCallFunction.name} not found`)
        }
        return tool
    }

    getActiveTools() {
        return this.activeTools
    }
}