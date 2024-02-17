import 'dotenv/config';
import { Client } from "@hubspot/api-client";
import Emails from "../../../src/tools/HubSpot/objects/Emails";
import {configDotenv} from "dotenv";

configDotenv();

describe('HubSpot Emails Integration Test', () => {
    let emails: Emails;
    let client: Client;

    const emailID = "35471724669";

    beforeAll(() => {
        const accessToken = process.env.HUBSPOT_API_KEY;
        if (!accessToken) {
            throw new Error('HubSpot API key not found in environment variables');
        }
        client = new Client({ accessToken });
        emails = new Emails(client);
    });

    it('should fetch and format emails from HubSpot', async () => {
        const searchResult = await emails.search("helfrich", 2);

        console.log(searchResult)

        expect(searchResult).toMatch(/ID \d+ - [a-zA-Z0-9- ]+/);
    });

    it('should fetch and format a email from HubSpot', async () => {
        const searchResult = await emails.fetch(emailID);
        const regexp = new RegExp(`ID ${emailID} - Le: [a-zA-Z0-9- :,]+`);
        expect(searchResult).toMatch(regexp);
    });
});