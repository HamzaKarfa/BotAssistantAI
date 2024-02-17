import BrowserOpenUrl from "../../src/tools/BrowserOpenUrl";

describe('BrowserOpenUrl tool', () => {
    let browser: BrowserOpenUrl;

    beforeAll(() => {
        browser = new BrowserOpenUrl();
    });

    it('should return the text of a web page', async () => {
        const result = await browser.handle({
            url: "https://cybele-lyon.fr/8-anecdotes-insolites-sur-le-grand-hotel-dieu-de-lyon/"
        });

        console.log(result);

        expect(result).toContain("Alexandre");
    }, 45000)
});