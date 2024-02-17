import ErrorHandler from "./handlers/ErrorHandler.js"
import OpenAIConnector from "./connectors/OpenAIConnector.js";
import DiscordConnector from "./connectors/DiscordConnector.js";
import Bot from "./Bot";
import config from "./config";
import BotlyConnector from "./connectors/BotlyConnector.js";

import * as Sentry from "@sentry/node";
import {ProfilingIntegration} from "@sentry/profiling-node";
import moment from "moment";


moment.locale('fr');

//if(config.NODE_ENV === 'production') {
    Sentry.init({
        dsn: 'https://e3c76bbc55676156b806d43c522e0981@o4504192352976896.ingest.sentry.io/4506393858473984',
        integrations: [
            new ProfilingIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0,
        // Set sampling rate for profiling - this is relative to tracesSampleRate
        profilesSampleRate: 1.0,
    });
//}

process.stdout.on('error', ErrorHandler.handle);
process.on('uncaughtException', ErrorHandler.handleUncaughtException);
process.on('unhandledRejection', ErrorHandler.handleRejection);

const discord = new DiscordConnector(config.DISCORD_BOT_TOKEN!);
const openai = new OpenAIConnector(config.OPENAI_API_KEY!);
const botly = new BotlyConnector();

const bot = new Bot(discord, openai, botly);

await bot.init();