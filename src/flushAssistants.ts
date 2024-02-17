import OpenAIConnector from "./connectors/OpenAIConnector";
import config from "./config";
import {AbstractPage} from "openai/core";
import {Assistant} from "openai/resources/beta";

const openai = new OpenAIConnector(config.OPENAI_API_KEY!);

const assistantPages = await openai.getAllAssistantsPages()
const pages = assistantPages.iterPages()
let currentPage: AbstractPage<Assistant> | void

while (currentPage = (await pages.next()).value) {
    for (const assistant of currentPage.getPaginatedItems()) {
        if(assistant.name?.match(/(Kafbot|Morgan) - [0-9]{4}/i)) {
            console.log(`Deleting ${assistant.name}`)
            await openai.deleteAssistant(assistant.id!)
        }
    }
}