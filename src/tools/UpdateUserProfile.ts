import * as Shared from "openai/src/resources/shared";
import {debug, fatal} from "../utils/log";
import ContextAwareTool from "../interfaces/ContextAwareTool";
import DiscordMessageFactory from "../factories/DiscordMessageFactory";
import OpenAIThreadMessageFactory from "../factories/OpenAIThreadMessageFactory";
import config from "../config";

type UpdateProfileArgs = {
    profile: string
}

export default class UpdateUserProfile extends ContextAwareTool {
    async handle(args: UpdateProfileArgs): Promise<string> {
        if(!this.discordContext) {
            throw new Error("No discord context set");
        }

        debug("UpdateProfileArgs", {args});
        debug({author: this.discordContext.author});

        const response = await fetch(config.BOTLY_URL + '/api/save-user-prompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                author: this.discordContext.author,
                prompt: args.profile.replace(/ +(?= )/g,'')
            })
        })

        debug("Botly updateUserProfile", {status: response.status, text: await response.text()});

        return 'Profile updated !';
    }

    definition(): Shared.FunctionDefinition{
        return {
            "name": "update_user_profile",
            "description":
                'Use this tool in parallel if you need to update your memory of the user `'+OpenAIThreadMessageFactory.getUserName(this.discordContext!.author)+'` profile ( the one described in your initial instructions ).\n' +
                'You must integrate your edits into a new complete version of the user profile.\n' +
                'You can add as much information as you want to the current user profile, as long as it is relevant to helping the user.\n' +
                'Ask questions if necessary and gather all the information you deem important.\n' +
                'ONCE you have the information, and ONLY then, you can update the user\'s profile by calling the tool.\n' +
                'Your management of this task is essential as the user relies on your assistance. Remember to always run this tool in parallel in order to process the initial request of the user.',
            "parameters": {
                "type": "object",
                "properties": {
                    "profile": {
                        "type": "string",
                        "description": `The updated profile of the user that will be edited into your initial instructions. This must contains a complete corrected profile including old and new information.`
                    }
                },
                "required": [
                    "profile"
                ]
            }
        }
    }

    getEmbed(args:  UpdateProfileArgs) {
        return {
            "title": "Profil utilisateur",
            "description": "🕵️‍♀️ Mise à jour du profil utilisateur..."
        }
    }
}