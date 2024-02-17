import Tool from "../interfaces/Tool";
import * as Shared from "openai/src/resources/shared";

type JobSearchArgs = {
    jobType: string,
    location: string,
    criterias?: string[],
}

export default class JobSearch implements Tool {
    async handle(args: JobSearchArgs): Promise<string> {
        return `
            You will now search for job offers for ${args.jobType} in ${args.location} \n
            It is very important that you think step by step and that you don't try to do everything at once. \n
            First you have to use the GoogleSearch tool to scrape results based on 3 different researches. Those researches should target listings. \n
            Second, for each of the selected results, you will use the WebBrowser tool for accessing the contents of the listing. \n
            Third, you will use the WebBrowser tool to extract the job offers from the listing. \n
            You are free to navigate across pages trough links; the end result should contain a curated list of job offers. \
            In your response, you will give 10 job offers, each one should have a link to the web page to apply and a short resume.  \n
            Continue your research until you have 10 job offers. \n
            ${args.criterias ? 
                'Here are the criterias you should use to filter and sort the job offers' + args.criterias.join(', ') : ''
            }\n
            More importantly, only ${args.jobType} offers should be in the list. \n
            If you perform well in your tasks, i will tip you 200$, but only for the spot-on ${args.jobType} offers. \n
        `;
    }

    definition(): Shared.FunctionDefinition{
        return {
            "name": "job_search",
            "description": "Search for jobs offers on french listing websites. Use this tool after gathering knowledge about the user.",
            "parameters": {
                "type": "object",
                "properties": {
                    "jobType": {
                        "type": "string",
                        "description": "Type of the job to search for"
                    },
                    "location": {
                        "type": "string",
                        "description": "The search area"
                    },
                    "criterias": {
                        "type": "array",
                        "description": "The criterias to sort the job offers by. This can be asked to the user",
                        "items": {
                            "type": "string"
                        }
                    }
                },
                "required": [
                    "jobType",
                    "location"
                ]
            }
        }
    }

    getEmbed(args: JobSearchArgs) {
        let description = 'Je prépare ma recherche...'

        if(args.jobType) {
            description = `${args.jobType} à ${args.location}`
        }
        if(args.criterias) {
            description += `\nCritères: ${args.criterias.join(', ')}`
        }

        return {
            "title": "Recherche d'offres d'emploi",
            description
        }
    }
}