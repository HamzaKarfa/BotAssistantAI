import {RequiredActionFunctionToolCall} from "openai/resources/beta/threads";
import Tool from "../interfaces/Tool.js";
import config from "../config";
import {ChatCompletionMessageParam} from "openai/resources";
import OpenAI from "openai";
import * as Shared from "openai/src/resources/shared";
import {EmbedData} from "discord.js";

type GPTVargs = {
    url: string,
    prompt: string
}

export default class GPTVision implements Tool {
    private client: OpenAI;

    constructor() {
        this.client = new OpenAI({apiKey: config.OPENAI_API_KEY!})
    }

    async handle(args: GPTVargs): Promise<string> {
        const output = await this.getVisionCompletion([{
            role: "user",
            content: args.prompt
        }], args.url)

        return output || ""
    }

    async getVisionCompletion(messages: ChatCompletionMessageParam[], url: string) {
        let lastMessageContent = messages[messages.length - 1].content;

        if(!Array.isArray(lastMessageContent)) {
            lastMessageContent = [{
                "type":"text",
                "text": lastMessageContent || ""
            }]
        }

        lastMessageContent.push({
            type: "image_url",
            image_url: {
                url: url,
            },
        })

        messages[messages.length - 1].content = lastMessageContent;

        const response = await this.client.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages,
            max_tokens: 2000,
        });
        return response.choices[0].message.content
    }

    definition(): Shared.FunctionDefinition{
        return {
            "name": "gpt_vision",
            "description": "You must don't use this tool for resume analysis. You had to use the resume_analysis tool instead. For all others purpose you can use this tool for taking images and answer questions about them.",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "URL of the image"
                    },
                    "prompt": {
                        "type": "string",
                        "description": "Question to ask about the image"
                    }
                },
                "required": ["url", "prompt"]
            }
        }
    }

    getEmbed(args: GPTVargs): EmbedData {
        return {
            "title": "👁️ Je regarde",
            "description": args.url,
        }
    }
}