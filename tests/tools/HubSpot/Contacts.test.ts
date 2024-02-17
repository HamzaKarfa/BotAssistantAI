import 'dotenv/config';
import { Client } from "@hubspot/api-client";
import Contacts from "../../../src/tools/HubSpot/objects/Contacts";
import {configDotenv} from "dotenv";

configDotenv();

describe('HubSpot Contacts Integration Test', () => {
    let contacts: Contacts;
    let client: Client;

    const contactID = "973151";

    beforeAll(() => {
        const accessToken = process.env.HUBSPOT_API_KEY;
        if (!accessToken) {
            throw new Error('HubSpot API key not found in environment variables');
        }
        client = new Client({ accessToken });
        contacts = new Contacts(client);
    });

    it('should fetch and format contacts from HubSpot', async () => {
        const searchResult = await contacts.search("antoine");
        expect(searchResult).toMatch(/ID \d+ - [a-zA-Z0-9- ]+ - [a-zA-Z0-9@.]+/);
    });

    it('should fetch and format a contact and its activity from HubSpot', async () => {
        const searchResult = await contacts.fetch(contactID);
        const regexp = new RegExp(`ID ${contactID} - [a-zA-Z0-9- ]+ - [a-zA-Z0-9@.]+\n\n.+`);
        expect(searchResult).toMatch(regexp);
    });
});