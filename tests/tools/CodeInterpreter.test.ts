import {configDotenv} from "dotenv";
import CodeInterpreter from "../../src/tools/archived/CodeInterpreter.xx";
import dd from "../../src/utils/dd";

configDotenv();

describe('cODEiNTERORETR tool', () => {
    let codeInterpreter: CodeInterpreter;

    beforeAll(() => {
        codeInterpreter = new CodeInterpreter();

    });

    it('should return an answer about an image', async () => {
        const result = await codeInterpreter.handle({
            pip_dependencies: ["PdfReader"],
            code: `
import requests
from PyPDF2 import PdfFileReader
import io

# Get PDF content
response = requests.get('https://cdn.discordapp.com/attachments/1181534499578839111/1181632789347573760/CV.pdf?ex=6581c44a&is=656f4f4a&hm=72cabb4fcc76056ce69306435f43b84bb9f47691d995c702175d8d8603669c2e')
data = response.content

# Read PDF file
pdf = PdfFileReader(io.BytesIO(data))
text = ''
for page in range(pdf.getNumPages()):
    text += pdf.getPage(page).extractText()

print(text)`
        });

        dd(result);

        expect(result).toContain("chat");
    }, 45000)
});