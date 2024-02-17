import {HubSpotObject} from '../HubSpotObject';

export default class Contacts extends HubSpotObject {
    getName(): string {
        return "contacts";
    }

    protected getReadableProperties(): string[] {
        return ["firstname", "lastname", "email", "phone"];
    }

    protected getAssociationNames() {
        return ["notes", "emails", "deals"];
    }
}