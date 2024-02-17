import Tool from "../interfaces/Tool";
import * as Shared from "openai/src/resources/shared";
import axios from "axios";
import {pdfToPng, PngPageOutput} from "pdf-to-png-converter";
import path from "node:path";
import fs from "fs";
import GPTVision from "./GPTVision";

type ReadPDFArgs = {
    url: string
}

export default class ReadPDF implements Tool {
    async handle(args: ReadPDFArgs): Promise<string> {
        let vision = new GPTVision();
        let base64String: string;
        let result: string;
        let failCount = 0;
        let output = "";

        do {
            try {
                const response = await axios.get(args.url, {
                    responseType: 'arraybuffer'
                });

                // Convert to png
                const pngPages: PngPageOutput[] = await pdfToPng(response.data, {
                    disableFontFace: false,
                    useSystemFonts: false,
                    enableXfa: false,
                    viewportScale: 2.0,
                    outputFolder: 'src/temp',
                    outputFileMask: 'cv',
                });

                // Convert to base64
                const imagePath = path.join('src/temp', `${pngPages[0].name}`);
                const imageBuffer = fs.readFileSync(imagePath);
                base64String = imageBuffer.toString('base64');

                // Send to Vision
                result = await vision.handle({
                    url: `data:image/png;base64, ${base64String}`,
                    prompt: `First you had to thoroughly analyze the provided document image.\n
                    Generate a meticulous transcription of any text present, with a focus on layout, font styles, and other relevant details.\n
                    Pay attention to formatting nuances, bullet points, headers, and any elements crucial for an accurate transcription.\n
                    Then, delve into the visual characteristics of the document.\n
                    Provide insights into the layout structure, font types, and sizes used.\n
                    Explore the spatial arrangements of elements, the hierarchy of information.\n
                    Highlight any other pertinent details contributing to the visual composition of the document.\n
                    Your goal is to present distinct responses for both the textual and visual aspects, offering a comprehensive retranscription of the document.\n
                    `
                });

                // delete the pdf file converted to png
                fs.unlinkSync(imagePath);

                output = result;
                break;
            } catch (error) {
                console.log({error});
                failCount++;
                output = `An error occured while trying to download the file: ${error}`;
            }
        } while (failCount < 3);
        return output;
    }

    definition(): Shared.FunctionDefinition{
        return {
            "name": "read_pdf",
            "description": "This tool is useful for reading a pdf file, it is used to extract all the text and visual informations from a pdf file",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        type: "string",
                        description: "The URL of the pdf fileV"
                    },
                },
                "required": ["url"]
            }
        }
    }

    getEmbed(args: ReadPDFArgs) {

        return {
            "title": "Lecture du PDF",
            "description": "Lecture du PDF avec les outils de Morgan",
        }
    }
}