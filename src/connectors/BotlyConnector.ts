import {Collection, Message} from "discord.js";
import dd from "../utils/dd";
import {debug, error} from "../utils/log";
import { ThreadCreateParams } from "openai/src/resources/beta/threads/threads";
import config from "../config";

export type BotlyContext = {prompts: {guild: string, channel: string, user:string}}

export default class BotlyConnector {
    async getChatContext(message: Message): Promise<BotlyContext> {
        const response = await fetch(config.BOTLY_URL + '/api/get-chat-context', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                channel: message.channel,
                guild: message.guild,
                author: message.author,
            })
        })
        const json =  await response.json();
        debug("BotlyConnector.getChatContext", json)
        return json;
    }

    async getUsersIdTeamsActiveMemorizeDM() {
        const response = await fetch(config.BOTLY_URL + "/api/get-users-memorize_dm", {
            method: 'POST',
        })
        const json = await response.json();
        debug("BotlyConnector.getUsersIdToMemorizeDm", json)
        return json;
    }

    async saveThread(messages: Array<any>, thread: any) {
        let body = JSON.stringify({
            messages: messages,
            threads: thread,
        });
        console.log(body);
        
        const response = await fetch(config.BOTLY_URL + "/api/save-memory-user-dm", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body
        })

        if (response.status !== 200 || response.statusText !== 'OK') {
            error("BotlyConnector.saveThread", response)
        }
        const json = await response.json();
        debug("BotlyConnector.saveThread", json)
        return json;
    };

    async saveMemoryOfChannel(userId: string, memory: string) {
        const response = await fetch(config.BOTLY_URL + "/api/save-memory-user-dm", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                discord_author_id: userId,
                memory_user_dm  : memory,
            })
        })
        const json = await response.json();
        debug("BotlyConnector.saveMemoryOfChannel", json)
        return json;
    }
}