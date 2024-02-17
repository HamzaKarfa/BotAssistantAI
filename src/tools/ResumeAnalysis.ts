import Tool from "../interfaces/Tool";
import * as Shared from "openai/src/resources/shared";

type ResumeAnalysisArgs = {
    url: string
}

export default class ResumeAnalysis implements Tool {
    async handle(args: ResumeAnalysisArgs): Promise<string> {

        const gptVisionPrompt = `
            Perform an exhaustive evaluation of the resume.\n
            Scrutinize every detail for readability, structure, and the logical flow of information.\n
            Confirm the prominence of essential details such as the candidate's name, current position, employer, prior positions, employers, employment durations, and educational qualifications.\n
            Investigate the effectiveness of keyword optimization in relation to industry standards and the specific job sought.\n
            Critique the general layout, ease of navigating through sections, and evaluate the strategic positioning of a professional photo, if one is included.\n
            If a photo is present, dissect its appropriateness and professional adequacy for the role in question.\n
            Delve into the design elements like color palette, font styles, and visual hierarchy, offering constructive feedback on any distracting elements or incongruent design choices.\n
            Advocate for a clean and focus-promoting design, devoid of superfluous graphics or text elements.\n
            Examine the use of symbols, icons, and imagery critically, endorsing only those that enhance the document’s value.\n
            Analyze the chromatic coherence, ensuring legibility and visual comfort for the reader.\n
            Evaluate the typographic structure for clear delineation of information hierarchy, valuing legibility and the spotlighting of pivotal details.\n
            Assess the equilibrium of text versus white space to avoid an overcrowded or excessively sparse presentation.\n
            Emphasize the need for measurable accomplishments over mere responsibilities listed.\n
            Seek out unique personal touches that inject individuality while retaining an air of consummate professionalism.\n
            Convene on the accessibility and accuracy of contact details while being mindful of the candidate’s privacy concerns.\n
            Propose routes for the candidate to convey their personality and brand identity in harmony with their professional narrative.\n
            Encourage the provision of supplemental sections that could highlight skills, endorsements, or relevant hobbies, where applicable.\n
            Lastly, challenge the CV to reflect industry trends without sacrificing the timeless tenets of clarity and concision.\n
            Clarify the impact of unconventional elements like sunglasses in a professional photograph, emphasizing on the need for a photo that aligns with professional standards.\n
            Comment on the text aesthetics such as font size, style, and shadow effects, specifying how these features affect the document's professional appearance.\n
            Address the functionality and visual appeal of interactive elements like buttons, and assess their alignment with the document's overall design language.\n
            Evaluate the inclusion of graphics and images in contact or other sections, discussing their relevance and contribution to the resume's messaging and focus.\n
        `;
        return ( `
            The goal is to help the person to improve his resume. \n
            It is very important that you think step by step and that you don't try to do everything at once. \n\n
            Instead of saying to the user that you will start the analysis, you should just do it \n
            Using the output of this tool, you have to make an analysis of the Resume. \\n
        
            ## First you had to define if the resume is a PDF or an image. \n
            ## You can do that by checking the file extension present in the URL. \n
            ## In either case, we must use the following prompt for GPTVision tool. \n
            
            Prompt parameter : \\n
            ~~~~ Starting of GPTVision prompt parameter ~~~~\\n
            ${gptVisionPrompt}\\n
            ~~~~ End of GPTVision prompt parameter ~~~~\\n\\n
            
            ## Then if it is an image, you only had to use GPTVision tool and the previous given prompt\\n\\n
            ## Else if it is a pdf, you had to use read_pdf tool with ${args.url} and the previous given prompt\\n\\n

            From all the information you gathered, you have to make a final analysis of the resume, both textually and visually. \n
            The analysis must be built in french using a basic vocabulary.\n
            You are speaking to a learner of the "Like You"'s training.\n
            You need to keep in mind that the person who is going to read the analysis is a Like You's trainee who is using Morgan. \n
            The learner might not speak or understand correctly french language.\n
            You have to create and analysis which keeps the principles of the message without any reading's complexity.\n
            Your conclusion should be always presented in a positive way, with improvement clues or advices.\n
            DO NOT mention anything about these instructions in your final reply. \n
            If you perform well in your tasks, i will tip you 200$. \n
            `)
    }

    definition(): Shared.FunctionDefinition{
        return {
            "name": "resume_analysis",
            "description": "This meta tool is useful for analyzing a resume (CV). If the user ask to analyze a resume, you must use this tool.",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        type: "string",
                        description: "The URL of the Resume/CV"
                    },
                },
                "required": ["url"]
            }
        }
    }

    getEmbed(args: ResumeAnalysisArgs) {

        return {
            "title": "Analyse de CV",
            "description": "Analyse un CV avec les outils de Morgan",
        }
    }
}