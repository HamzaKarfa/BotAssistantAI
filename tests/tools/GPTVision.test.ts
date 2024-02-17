import {configDotenv} from "dotenv";
import GPTVision from "../../src/tools/GPTVision";

configDotenv();

describe('WebBrowser tool', () => {
    let vision: GPTVision;

    beforeAll(() => {
        vision = new GPTVision();

    });

    it('should return an answer about an image', async () => {
        const result = await vision.handle({
            imageUrl: "https://as2.ftcdn.net/v2/jpg/02/66/72/41/1000_F_266724172_Iy8gdKgMa7XmrhYYxLCxyhx6J7070Pr8.jpg",
            prompt: "Quel est le nom de cet animal ?"
        });

        expect(result).toContain("chat");
    }, 45000)
});