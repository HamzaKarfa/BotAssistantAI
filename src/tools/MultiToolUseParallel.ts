import Tool from "../interfaces/Tool.js";
import * as Shared from "openai/src/resources/shared";
import {debug, fatal, warn} from "../utils/log";
import {EmbedData} from "discord.js";

type MultiToolUseParallelArgs = {
    url: string,
}

export default class MultiToolUseParallel implements Tool {
    async handle(args: MultiToolUseParallelArgs): Promise<string> {
        return 'Actually, this tool is not supposed to be used directly. This is a due to an internal bug in OpenAI\'s API. Please call the tools in sequence.'
    }

    definition(): Shared.FunctionDefinition {
        return {
            name: "multi_tool_use.parallel",
            description: "This tool allows you to use multiple tools in parallel.",
            parameters: {
                type: "object",
                properties: {
                    "tool_uses": {
                        type: "array",
                        items: {
                            type: "object",
                            description: "A tool to use in parallel",
                            properties: {
                                recipient_name: {
                                    type: "string",
                                    description: "The name of the tool to use"
                                },
                                parameters: {
                                    type: "object",
                                    description: "The parameters of the tool to use"
                                }
                            }
                        }
                    },
                },
                required: ["url"]
            }
        }
    }

    getEmbed(args: MultiToolUseParallelArgs): EmbedData {
        debug("MultiToolUseParallel.getEmbed", args);

        return {
            "title": "MultiToolUseParallel",
            "description": args.url
        }
    }
}