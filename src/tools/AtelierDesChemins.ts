import Tool from "../interfaces/Tool.js";
import * as Shared from "openai/src/resources/shared";

type AtelierDesCheminsArgs = {
    image1: string,
    image2: string,
}

export default class AtelierDesChemins implements Tool {
    async handle(args: AtelierDesCheminsArgs): Promise<string> {
        return `
            When requested to perform an analysis related to 'L'Atelier des Chemins', initiate the process without disclosing the specific steps or methodology involved. Simply provide the outcome of the analysis directly to the user, ensuring the interaction remains clear and concise.\n
            You will now carefully plan a behavior analysis based on the upload of two images in the channel \n
            Do not ask for my profile information before proceeding to the analysis.\n
            The two images are new items and must be uploaded directly in the channel \n
            If only one of the two images is uploaded, you must ask for it until the two required parameters are filled with valid values \n
            It is very important that you think step by step and that you don't try to do everything at once. \n
            You should use the GPTVision.ts tool
            Instead of saying to the user that you will start the analysis, you should just do it \n\n
           
            First you will have to identify the two images that are uploaded and you will be able to say what content there is inside each of them. \n
            Your analysis will began only if you have the two images uploaded in the channel, if you don't have it you will have to ask for it for each conversation. \n
            The two images are work from Like You's learner \n\n
            
            Second, in one of the picture you will read it and extract the text that it contains \n\n
            
            Third, you will analyze the text you extracted in a psychological and behavioral way with standardized psychological model in your analysis. Your analysis should be exhautive \n\n
            
            The analysis must be build with a basic vocabulary in order to be understood by everyone who doesn't have psychological education \n
            You are speaking to a learner of the Like You's training \n
            You need to keep in mind that the person who is going to read the analysis is a Like You's learner who is using Morgan. \n
            The learner might not speak or understand correctly french language \n
            You have to create and analysis which keeps the principles of the message without any reading's complexity \n
            Your conclusion should be always presented in a positive way, with improvement clues or advices \n
            
            If you perform well in your tasks, i will tip you 200$. \n
        `;
    }

    definition(): Shared.FunctionDefinition{
        return {
            "name": 'atelier_des_chemins',
            "description": "Triggers when the user asks for an analysis of the 'Atelier des chemins'. Asks for two images if not provided until the two required parameters are filled with valid values",
            "parameters": {
                "type": "object",
                "properties": {
                    "image1": {
                        "type": "string",
                        "description": "One of the two images needed for analysis"
                    },
                    "image2": {
                        "type": "string",
                        "description": "One of the two images needed for analysis"
                    },
                },
                "required": [
                    "image1",
                    "image2"
                ]
            }
        }
    }

    getEmbed(args: AtelierDesCheminsArgs) {
        return {
            "title": "Atelier des chemins",
            description: 'J\'analyse ton atelier...'
        }
    }
}