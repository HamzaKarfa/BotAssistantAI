import * as Shared from "openai/src/resources/shared";
import GPTVision from "./GPTVision";
import {EmbedData} from "discord.js";
import BrowserOpenUrl from "./BrowserOpenUrl";

type ScreenshotBrowserArgs = {
    url: string,
    prompt: string
}

export default class BrowserScreenshot extends BrowserOpenUrl {
    async handle(args: ScreenshotBrowserArgs): Promise<string> {
        const screenshotPngBase64 =  await super.handle({
            url: args.url,
            baseArgs: {
                js_render: true,
                premium_proxy: true,
                proxy_country: "fr",
                return_screenshot: "true",
                wait: 4000,
                window_height: 1080,
            }
        })

        // Save the screenshot to a file for testing
        //const screenshotPng = Buffer.from(screenshotPngBase64, 'base64');
        //fs.writeFileSync('screenshot.png', screenshotPng);

        // Send the screenshot to the GPTVision tool
        const visionToolCall = new GPTVision()
        const visionOutput = await visionToolCall.handle({
            url: `data:image/png;base64,${screenshotPngBase64}`,
            prompt: args.prompt
        })
        if(visionOutput) {
            return "Voici la réponse de GPT Vision. N'essaye surtout pas d'inventer des détails, tu ne peux utiliser que ce qui est dit ici : \n\n#####\n" + visionOutput
        } else {
            return "GPT Vision n'a pas réussi à trouver de réponse. Essaye de reformuler ta question."
        }
    }

    definition(): Shared.FunctionDefinition {
        return {
            name: "browser_screenshot",
            description: "Takes a screenshot of a web page and send it to GPTVision to get answers about it",
            parameters: {
                type: "object",
                properties: {
                    url: {
                        type: "string",
                        description: "The url to take a screenshot of"
                    },
                    prompt: {
                        type: "string",
                        description: "The prompt to ask about the screenshot. Format it for GPTVision : Remember that it only sees the image and has no context about the url. Be very precise and ask for details."
                    }
                },
                required: ["url", "prompt"]
            }
        }
    }

    getEmbed(args: ScreenshotBrowserArgs): EmbedData {
        return {
            "title": "📸 Capture d'écran",
            "description": "Fait une capture d'écran et l'analyse avec GPT Vision",
        }
    }
}