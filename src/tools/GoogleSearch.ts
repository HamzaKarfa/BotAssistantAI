import * as process from "process";
import {getJson as searchApiSearch} from "serpapi";
import {RequiredActionFunctionToolCall} from "openai/resources/beta/threads";
import Tool from "../interfaces/Tool.js";
import * as Shared from "openai/src/resources/shared";

type GoogleSearchResult = {
    title: string,
    snippet: string,
    link: string,
}
type GoogleSearchArgs = {
    query: string
}

export default class GoogleSearch implements Tool {
    async handle(args: GoogleSearchArgs): Promise<string> {
        const results = await searchApiSearch({
            api_key: process.env.SERPAPI_KEY,
            engine: 'google',
            q: args.query,
            location: 'France',
            hl: 'fr',
            google_domain: 'google.fr',
        })
        return (results.organic_results || []).map((result: GoogleSearchResult) =>
            result.title + "\n" + result.snippet + "\n" + result.link
        ).join("\n\n") + "\n\n#########\n\n#########\n\n" +
        "Current page : " + (results.serpapi_pagination?.current ?? "") + "\n\n#########\n\n" +
        "It is probably a good idea to use the `browser_open_url` tool to open the link and read the whole page if the snippet is not enough."
    }

    definition(): Shared.FunctionDefinition{
        return {
            "name": "google_search",
            "description": "Issues a query to a search engine and displays the results. This function allows you to specify a search query.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query. Use english for technical queries, french for general queries."
                    }
                },
                "required": [
                    "query"
                ]
            }
        }
    }

    getEmbed(args: GoogleSearchArgs) {
        return {
            "title": "🌎 Recherche Google",
            "description": args.query
        }
    }
}