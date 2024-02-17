import { Client } from '@hubspot/api-client';
import Tool from "../interfaces/Tool.js";
import {HubSpotObject} from "./HubSpot/HubSpotObject.js";
import autoInject from "../utils/autoInject.js";
import {RequiredActionFunctionToolCall} from "openai/resources/beta/threads";
import {debug, info} from "../utils/log.js";
import config from "../config.js";
import dd from "../utils/dd.js";
import * as Shared from "openai/src/resources/shared";

type HubSpotToolArguments = {
    objectName: string,
    query?: string,
    id?: string,
    limit?: number
}

export default class HubSpot implements Tool {
    private readonly client: Client;
    private objects: {[key:string]: HubSpotObject} = {};

    constructor() {
        this.client = new Client({ accessToken: config.HUBSPOT_API_KEY });
        this.autoloadObjects();
    }

    private async autoloadObjects() {
        const objectInstances = await autoInject("tools/HubSpot/objects/*.js", [this.client]) as HubSpotObject[];

        for (const objectInstance of objectInstances) {
            this.objects[objectInstance.getName()] = objectInstance;
        }
    }

    async handle(args: HubSpotToolArguments): Promise<string> {
        const object = this.objects[args.objectName];

        info("[HUBSPOT TOOL]", args);

        if (!object) {
            throw new Error("Invalid object type specified");
        }

        if(args.id) {
            return await object.fetch(args.id);
        }

        return await object.search(args.query, args.limit);
    }

    definition(): Shared.FunctionDefinition {
        return {
            "name": "hubspot",
            "description": "Search or Read contacts, companies and deals from HubSpot. Use id parameter to read a specific object.",
            "parameters": {
                "type": "object",
                "properties": {
                    "objectName": {
                        "type": "string",
                        "enum": ["contacts", "deals", "companies", "emails"],
                        "description": "Type of object data to fetch"
                    },
                    "query": {
                        "type": "string",
                        "description": "Query to search for"
                    },
                    "id" : {
                        "type": "string",
                        "description": "ID of object to fetch"
                    },
                    "limit": {
                        "type": "number",
                        "description": "Maximum number of objects to fetch"
                    }
                },
                "required": ["objectName"]
            }
        };
    }

    getEmbed(args: HubSpotToolArguments) {
        let description = `Requesting HubSpot for ${args.objectName}`;

        if(args.query) {
            description = `Searching ${args.objectName} for "${args.query}"`;
        }
        else if(args.id) {
            description = `Fetching ${args.objectName} with ID ${args.id}`;
        }

        return {
            "title": "🔗 HubSpot Read Data",
            "description": description
        };
    }
}