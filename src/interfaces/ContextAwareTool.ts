import {Message} from "discord.js";
import Tool from "./Tool";

export default abstract class ContextAwareTool extends Tool {
    protected discordContext?: Message;

    setDiscordContext(message: Message) {
        this.discordContext = message
    }
}