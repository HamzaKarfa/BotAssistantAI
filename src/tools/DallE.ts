import {RequiredActionFunctionToolCall} from "openai/resources/beta/threads";
import Tool from "../interfaces/Tool.js";
import config from "../config.js";
import OpenAI from "openai";
import * as Shared from "openai/src/resources/shared";
import {EmbedData} from "discord.js";

type DallEArgs = {
    prompt: string,
    size: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792"
    numOutputs?: number,
}

export default class DallE implements Tool {
    private client: OpenAI;

    constructor() {
        this.client = new OpenAI({apiKey: config.OPENAI_API_KEY!})
    }

    async handle(args: DallEArgs): Promise<string> {

        const response = await this.client.images.generate({
            model: "dall-e-3",
            prompt: args.prompt,
            n: args.numOutputs || 1
        });

        console.log("Dall-E response OK")

        return (await Promise.all(
            response.data.map(async(image) => {
                const response = await fetch('https://www.urlday.com/api/v1/links', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer dB2EYulPVnxOEgoaaDmp1IyKJhUJiS9vkvOTvJ9IxjRL6vdHLjUPfxF67vE1',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        url: image.url
                    })
                })
                const json: {data: {short_url: string}} = await response.json()
                return json.data.short_url as string
            })
        )).join("\n") 
    } 

    definition(): Shared.FunctionDefinition{
        return {
            "name": "dall_e",
            "description": "Generates an image from a prompt",
            "parameters": {
                "type": "object",
                "properties": {
                    "prompt": {
                        "type": "string",
                        "description": "The prompt to generate an image from. Format the prompt for Dall-E 3"
                    },
                    "size": {
                        "type": "string",
                        "description": "The size of the image to generate",
                        "enum": ["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"]
                    },
                    "numOutputs": {
                        "type": "number",
                        "description": "The number of images to generate",
                        "default": 1
                    }
                },
                "required": ["prompt", "size"]
            }
        }
    }

    getEmbed(args: DallEArgs): EmbedData {
        return {
            "title": "🖼️️ Dall-E",
            "description": "Je dessine",
        }
    }
}