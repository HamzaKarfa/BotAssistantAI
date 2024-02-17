import {HubSpotObject} from '../HubSpotObject';

export default class Emails extends HubSpotObject {
    getName(): string {
        return "emails";
    }

    protected getReadableProperties(): string[] {
        return [
            "hs_email_sender_email",
            "hs_email_sender_firstname",
            "hs_email_sender_lastname",
            "hs_email_subject",
            "hs_email_text",
            "hs_email_to_email"
        ]
    }

    protected getAssociationNames() {
        return [];
    }
}