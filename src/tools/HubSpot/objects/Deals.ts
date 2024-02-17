import {HubSpotObject} from '../HubSpotObject';

export default class Deals extends HubSpotObject {
    getName(): string {
        return "deals";
    }

    protected getReadableProperties(): string[] {
        return ["dealname", "dealstage", "amount", "closedate"];
    }

    protected getAssociationNames() {
        return ["notes", "emails"];
    }
}