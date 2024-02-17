import Tool from "../interfaces/Tool.js";
import * as Shared from "openai/src/resources/shared";
import {debug} from "../utils/log";
import OpenAI, {toFile} from "openai";
import config from "../config";
import axios, {AxiosResponse } from "axios";
import {ReadStream} from "node:fs";
import dd from "../utils/dd";

type VocalArgs = {
    url: string,
}

export default class SpeechToText implements Tool {
    private client: OpenAI;

    constructor() {
        this.client = new OpenAI({apiKey: config.OPENAI_API_KEY})
    }

    async handle(args: VocalArgs): Promise<string> {
        debug("Vocal : " + args.url);

        // Fetch the audio file
        const response: AxiosResponse<ReadStream> = await axios.get(args.url, { responseType: 'stream' });

        // Transcribe the audio file to text
        const transcription = await this.client.audio.transcriptions.create({
            file: await toFile(response.data, 'audio.ogg'),
            model: "whisper-1",
        });

        return transcription.text;
    }

    definition(): Shared.FunctionDefinition{
        return {
            "name": 'speech_to_text',
            "description": "Discord audio attachment to text. Use this tool to get the text from an audio file.",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "URL of the audio file"
                    }
                },
                "required": [
                    "url"
                ]
            }
        }
    }

    getEmbed(args: any) {
        return {
            "title": "👂 J'écoute",
            "description": "Lecture de l'audio",
        }
    }
}