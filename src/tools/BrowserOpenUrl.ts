import Tool from "../interfaces/Tool.js";
import * as Shared from "openai/src/resources/shared";
import {debug, fatal, warn} from "../utils/log";
import {EmbedData} from "discord.js";
import {convert} from "html-to-text";
import {ZenRows} from "zenrows";
import config from "../config";
import axios, {AxiosError} from "axios";

interface ZenRowsConfig {
    autoparse?: boolean;
    css_extractor?: string;
    js_render?: boolean;
    premium_proxy?: boolean;
    proxy_country?: string;
    wait_for?: string;
    wait?: number;
    block_resources?: string;
    window_width?: number;
    window_height?: number;
    device?: string;
    original_status?: boolean;
    custom_headers?: boolean;
    [x: string]: unknown;
}

type BrowserOpenUrlArgs = {
    url: string,
    baseArgs?: ZenRowsConfig
}

export default class BrowserOpenUrl implements Tool {
    async handle(args: BrowserOpenUrlArgs): Promise<string> {
        const client = new ZenRows(config.ZENROWS_API_KEY!);
        const parentClassName = this.constructor.name;

        debug({url: args.url})

        if(!args.baseArgs) {
            args.baseArgs = {}
        }

        const jsRenderParams = {
            js_render: true,
            premium_proxy: true,
            proxy_country: "fr"
        }

        const maxAttempts = 3;
        let attempt = 0;
        let response;

        while (attempt < maxAttempts) {
            try {
                const params = attempt === 0 ? args.baseArgs : jsRenderParams;
                debug(parentClassName + " trying params", { args: params });

                if (args.baseArgs.return_screenshot) {
                    response = await axios.get("https://api.zenrows.com/v1/", {
                        params: {
                            ...params,
                            url: args.url,
                            apikey: config.ZENROWS_API_KEY
                        },
                        responseType: "arraybuffer"
                    })
                    return Buffer.from(response.data, 'binary').toString('base64');
                }

                response = await client.get(args.url, params);
                debug(parentClassName + " Success", { response: response.data });

                return convert(response.data);
            } catch (e: AxiosError | any) {
                if (attempt < maxAttempts - 1) {
                    warn(parentClassName + " Fail, will try JS Render", { url: args.url });
                } else {
                    fatal(parentClassName + " Fail", {
                        url: args.url,
                        status: e.response?.status,
                        message: e.message,
                    });
                    throw e;
                }
            }
            attempt++;
        }

        return "";
    }


    definition(): Shared.FunctionDefinition {
        return {
            name: "browser_open_url",
            description: "Opens the given URL and displays it. This function is for directly accessing a specific webpage. "
                + "This tool can also be used to read plain-text discord attachments like code.",
            parameters: {
                type: "object",
                properties: {
                    "url": {
                        type: "string",
                        description: "The URL of the web page to browse"
                    },
                    //query: {
                    //    type: "string",
                    //    description: "The optional query to search in the web page"
                    //}
                },
                required: ["url"]
            }
        }
    }

    getEmbed(args: BrowserOpenUrlArgs): EmbedData {
        debug("BrowserOpenUrl.getEmbed", args);

        return {
            "title": "🌎 Navigateur web",
            "description": args.url
        }
    }
}