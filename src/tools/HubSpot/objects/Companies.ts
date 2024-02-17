import {HubSpotObject} from '../HubSpotObject';

export default class Companies extends HubSpotObject {
    getName(): string {
        return "companies";
    }

    protected getReadableProperties(): string[] {
        return ["name", "description", "phone", "address"];
    }

    protected getAssociationNames() {
        return ["notes", "emails", "deals"];
    }
}