import DiscordConnector from "../connectors/DiscordConnector";
import * as cron from "node-cron";
import OpenAIConnector from "../connectors/OpenAIConnector";
import { Thread, ThreadCreateParams } from "openai/src/resources/beta/threads/threads";
import Tool from "../interfaces/Tool";
import OpenAIThreadMessageFactory from "../factories/OpenAIThreadMessageFactory";
import config from "../config";
import ToolCallExecutor from "./ToolCallExecutor";
import AssistantRunExecutor from "./AssistantRunExecutor";
import RunObserver from "../observers/RunObserver";
import BotlyConnector from "../connectors/BotlyConnector";
import { Collection, Message } from "discord.js";
import { debug, info } from "../utils/log";


export default class CronJobExecutor {
    constructor() {}

    public execute(pattern:string, callback: () => void) {
        cron.schedule(pattern, async () => {
            callback()
        }, {
           timezone: 'Europe/Paris'
        });
    }

}



