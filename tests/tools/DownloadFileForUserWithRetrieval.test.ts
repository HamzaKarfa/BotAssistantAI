import {configDotenv} from "dotenv";
import DownloadFileForUseWithRetrieval from "../../src/tools/archived/DownloadFileForUseWithRetrieval.xx";

configDotenv();

describe('DownloadFileForUserWithRetrieval tool', () => {
    let tool: DownloadFileForUseWithRetrieval;

    beforeAll(() => {
        tool = new DownloadFileForUseWithRetrieval();
    });

    it('should uploads a file from discord url to openai files', async () => {
        const result = await tool.handle({
            url: "https://cdn.discordapp.com/attachments/1181534499578839111/1197826593150750760/CV.pdf"
        });

        expect(result).toContain("File downloaded");
    }, 45000)
});