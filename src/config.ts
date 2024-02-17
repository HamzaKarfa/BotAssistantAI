import {configDotenv} from "dotenv";

configDotenv();

const config = {
    NODE_ENV: process.env.NODE_ENV || "local",
    CHROME_ENV: process.env.CHROME_ENV || "local",
    DEBUG: process.env.DEBUG,
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
    DISCORD_BOT_CLIENT_ID: process.env.DISCORD_BOT_CLIENT_ID,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_API_ASSISTANT_ID: process.env.OPENAI_API_ASSISTANT_ID,
    SERPAPI_KEY: process.env.SERPAPI_KEY,
    HUBSPOT_API_KEY: process.env.HUBSPOT_API_KEY,
    GITLAB_TOKEN: process.env.GITLAB_TOKEN,
    DISCORD_MESSAGES_LIMIT: parseInt(process.env.DISCORD_MESSAGES_LIMIT || '0') || 5,
    BOT_ENABLED_TOOLS: process.env.BOT_ENABLED_TOOLS?.split(",") || ['*'],
    BOT_DISABLED_TOOLS: process.env.BOT_DISABLED_TOOLS?.split(",") || [],
    ZENROWS_API_KEY: process.env.ZENROWS_API_KEY,
    CHANNEL_ID: process.env.CHANNEL_ID,
    BOTLY_URL: process.env.BOTLY_URL || "https://botly.kaffein.tech",
    REACTION_EMOJI: process.env.REACTION_EMOJI || "🤖",
    COMMAND: process.env.COMMAND || "bot",
}

export default config
