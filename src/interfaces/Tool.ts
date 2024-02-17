import * as Shared from "openai/src/resources/shared";
import {EmbedData} from "discord.js";

export default abstract class Tool {
    abstract handle(args: { [k:string]: any }): Promise<string>
    abstract getEmbed(args: { [k:string]: any }): EmbedData
    abstract definition(): Shared.FunctionDefinition
}