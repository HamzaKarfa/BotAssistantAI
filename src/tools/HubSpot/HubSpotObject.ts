import {Client} from "@hubspot/api-client";
import {
    PublicObjectSearchRequest,
    SimplePublicObjectWithAssociations
} from "@hubspot/api-client/lib/codegen/crm/objects";
import {SimplePublicObject} from "@hubspot/api-client/lib/codegen/crm/contacts";
import Helper from "./Helper";

export type HubspotApiObject = SimplePublicObject | SimplePublicObjectWithAssociations;
export type HubSpotApiAssociatedObjectsByName = { [key: string]: HubspotApiObject[] };
export type HubSpotApiProperties = { [key: string]: string | null}
export type SearchRequest = string | null | undefined;

export abstract class HubSpotObject {
    constructor(protected client: Client) {
    }

    protected  abstract getReadableProperties(): string[];

    abstract getName(): string;

    async search(searchRequest: SearchRequest, limit = 10): Promise<string> {
        // @ts-ignore
        const params = {
            limit,
            sorts: [{"propertyName":"hs_createdate","direction": "DESCENDING"}],
            properties: this.getReadableProperties(),
            filterGroups: [],
            after: 0,
        } as PublicObjectSearchRequest

        if (searchRequest) {
            params.query = searchRequest;
        }

        const response = await this.client.crm.objects.searchApi.doSearch(this.getName(), params);
        return Helper.formatOutput(response.results);
    }

    async fetch(id: string): Promise<string> {
        const response = await this.client.crm.objects.basicApi.getById(this.getName(), id);
        const associations = await this.fetchAssociations([id]);
        return Helper.formatOutput([response], associations);
    }


    protected async fetchAssociation(name: string, associatedObjectIds: string[]) {
        const settings = Helper.getAssociationSettings(name, this.client);
        const response = await settings.api.searchApi.doSearch({
            filterGroups: [{
                filters: [{
                    propertyName: "associations.contact",
                    operator: "IN",
                    values: associatedObjectIds
                }]
            }],
            limit: settings.limit,
            // @ts-ignore
            sorts: [{"propertyName":settings.sortBy,"direction": "DESCENDING"}],
            properties: settings.properties,
            after: 0
        });

        return response.results;
    }

    protected async fetchAssociations(objectIds: string[]): Promise<HubSpotApiAssociatedObjectsByName | null> {
        const associations = {} as HubSpotApiAssociatedObjectsByName;
        const associationsToFetch = this.getAssociationNames();
        if (associationsToFetch.length === 0) {
            return null;
        }
        for (const association of associationsToFetch) {
            associations[association] = await this.fetchAssociation(association, objectIds);
        }

        return associations;
    }

    protected abstract getAssociationNames(): string[];
}