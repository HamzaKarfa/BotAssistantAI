import {HubSpotApiAssociatedObjectsByName, HubspotApiObject, HubSpotApiProperties} from "./HubSpotObject";
import NotesDiscovery from "@hubspot/api-client/lib/src/discovery/crm/objects/notes/NotesDiscovery";
import EmailsDiscovery from "@hubspot/api-client/lib/src/discovery/crm/objects/emails/EmailsDiscovery";
import {Client} from "@hubspot/api-client";
import DealsDiscovery from "@hubspot/api-client/lib/src/discovery/crm/deals/DealsDiscovery";

export default class Helper {
    static formatOutput(
        results: HubspotApiObject[],
        associations: HubSpotApiAssociatedObjectsByName | null = null
    ): string {
        return `${Helper.formatObjects(results, true)}\n\n\n\n${associations ? Helper.formatAssociations(associations) : ""}`
    }

    static formatAssociations(associations: HubSpotApiAssociatedObjectsByName): string {
        return Object.entries(associations).map(([associationName, associationObjects]) => {
            if (associationObjects.length === 0) {
                return "";
            }
            return `${associationName.toUpperCase()} -\n\n ${Helper.formatObjects(associationObjects)}`
        }).join("\n\n");
    }

    static formatObjects(objects: HubspotApiObject[], withId: boolean = false): string {
        return objects.map((object) => {
            return (withId ? `ID ${object.id} - ` : '') + Helper.formatProperties(object.properties)
        }).join("\n________\n")
    }

    static formatProperties(properties: HubSpotApiProperties) {
        const mapping = Helper.mappedProperties();
        return Object.entries(properties)
            .filter(([property, value]) => value && !Helper.ignoredProperties().includes(property))
            .map(([property, value]) => {
                return `${mapping[property] ?? property}: ${Helper.excerpt(value)}`
            }).join(", ")
    }

    static excerpt(text?: string|null, length: number = 1000) {
        if(!text) return "";
        return text.substring(0, length) + (text.length > length ? "..." : "");
    }

    static ignoredProperties(): string[] {
        return [
            "hs_object_id",
            "hs_object_createdate",
            "createdate",
            "hs_timestamp",
            "lastmodifieddate",
            "hs_object_lastmodifieddate",
            "hs_lastmodifieddate"
        ];
    }

    protected static mappedProperties(): { [key: string]: string } {
        return {
            "firstname": "Prénom",
            "lastname": "Nom",
            "email": "Email",
            "phone": "Tel",
            "hs_object_id": "ID",
            "hs_note_body": "Note",
            "hs_email_sender_email": "De",
            "hs_email_sender_firstname": "Prénom",
            "hs_email_sender_lastname": "Nom",
            "hs_email_subject": "Sujet",
            "hs_email_text": "Texte",
            "hs_email_to_email": "À",
            "hs_createdate" : "Le",
            "dealname": "Nom",
            "dealstage": "Étape",
            "closedate": "Date de cloture",
            "amount": "Montant",
        }
    }

    static getAssociationSettings(name: string, client: Client) {
        let settings: {
            api: NotesDiscovery | EmailsDiscovery | DealsDiscovery,
            properties: string[],
            limit: number,
            sortBy: string
        };
        switch (name) {
            case "notes":
                settings = {
                    api: client.crm.objects.notes,
                    properties: ["hs_note_body"],
                    limit: 5,
                    sortBy: "hs_timestamp"
                };
                break;
            case "emails":
                settings = {
                    api: client.crm.objects.emails,
                    properties: [
                        "hs_email_sender_email",
                        "hs_email_sender_firstname",
                        "hs_email_sender_lastname",
                        "hs_email_subject",
                        "hs_email_text",
                        "hs_email_to_email"
                    ],
                    limit: 3,
                    sortBy: "hs_createdate"
                };
                break;
            case "deals":
                settings = {
                    api: client.crm.deals,
                    properties: [
                        "dealname",
                        "dealstage",
                        "closedate",
                        "amount",
                    ],
                    limit: 3,
                    sortBy: "closedate"
                };
                break;
            default:
                throw new Error("Unknown association type " + name);
        }
        return settings;
    }
}