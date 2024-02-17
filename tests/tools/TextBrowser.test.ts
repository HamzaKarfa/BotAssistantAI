import WebBrowser from "../../src/tools/archived/WebBrowser.xx";

describe('WebBrowser tool', () => {
    let browser: WebBrowser;

    beforeAll(() => {
        browser = new WebBrowser();
    });

    it('should return the text of a web page', async () => {
        const result = await browser.handle({
            //url: "https://google.com"
            url: "https://cdn.discordapp.com/attachments/1112505733934747648/1184850800145600592/GPTVision.ts?ex=658d794c&is=657b044c&hm=6119865d84b1f597f1271737ab553e9aa137ac3be6e9868e1ac889435733335f&"
        });

        console.log(result);

        expect(result).toContain("Google");
    }, 45000)
});