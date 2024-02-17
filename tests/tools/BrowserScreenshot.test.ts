import BrowserScreenshot from "../../src/tools/BrowserScreenshot";

describe('BrowserScreenshot tool', () => {
    let browser: BrowserScreenshot;

    beforeAll(() => {
        browser = new BrowserScreenshot();
    });

    it('should return the screenshot of a PDF web page', async () => {
        const result = await browser.handle({
            // good resume
            // url: "https://docs.google.com/viewer?url=https://cdn.discordapp.com/attachments/1081990045956845821/1199377994309980160/CV.pdf",
            // bad resume
            url: "https://resumegenius.com/wp-content/uploads/amateur-graphic-designer-bad-resume-example.png",
            prompt: `Perform an exhaustive evaluation of the resume.\n
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
            `
        });

        console.log(result);

        expect(result).toContain("CV");
    }, 10000)

    it('should return the screenshot of a web page', async () => {

    }, 10000)
});