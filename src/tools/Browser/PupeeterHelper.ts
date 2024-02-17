import puppeteer from "puppeteer-extra";
import {Browser, Page} from "puppeteer";
import chromium from "@sparticuz/chromium";
import config from "../../config";

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
import StealthPlugin from "puppeteer-extra-plugin-stealth";
// Add adblocker plugin to block all ads and trackers (saves bandwidth)
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import {debug} from "../../utils/log";

puppeteer.use(StealthPlugin())
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

let browser: Browser | null = null;

const init = async () => {
    const browserVersionResponse = await fetch(`http://145.239.13.99:9222/json/version`);
    const browserVersion: {webSocketDebuggerUrl: string} = await browserVersionResponse.json();
    const browserWSEndpoint = browserVersion.webSocketDebuggerUrl;

    if (config.CHROME_ENV === 'production') {
        browser = await puppeteer.connect({
            browserWSEndpoint: browserWSEndpoint,
            ignoreHTTPSErrors: true,
            protocolTimeout: 240000,
        });
    } else {
        browser = await puppeteer.launch({
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
            defaultViewport: chromium.defaultViewport,
            //args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
            ignoreDefaultArgs: ['--disable-extensions'],
            protocolTimeout: 240000,
        });
    }

    const pages = await browser.pages();
    for (let i = 0; i < pages.length; i++) {
        await pages[i].close();
    }


    return browser;
}

export default class PupeeterHelper {
    static async browse(url: string, promise: (page: Page) => Promise<void>): Promise<void> {
        if(!browser) {
            await init();
        }
        if(!browser) {
            throw new Error("Browser is not connected")
        }

        try {
            const page = await browser.newPage();

            await page.goto(url, {
                waitUntil: "load",
            });

            await promise(page);

            debug("[WebBrowser] Closing page")
            await page.close()

        } catch (error) {
            console.error(error);
        }
    }
}