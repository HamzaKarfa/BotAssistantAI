import Tool from "../../interfaces/Tool";
import * as Shared from "openai/src/resources/shared";
import dns from 'dns';
import dkimSignature from 'dkim-signature';
import dmarcParser from 'dmarc-solution';

type Args = {
    domain: string,
}

export default class DnsDmarcSpfDkimValidation implements Tool {

    async handle(args: Args): Promise<string> {
        let result = '';

        try {
            // Check for DMARC record
            const dmarcText = await dns.txt(args.domain);
            result += `DMARC: Found\n`;
            const dmarc = dmarcParser.parse(dmarcText[0]);
            result += `DMARC Policy: ${dmarc.p}\n`;
        } catch (error) {
            result += `DMARC: Not Found\n`;
        }

        try {
            // Check for SPF record
            const spfText = await dns.txt(domain);
            result += `SPF: Found\n`;
        } catch (error) {
            result += `SPF: Not Found\n`;
        }

        try {
            // Check for DKIM record
            const keys = await dkimSignature.getKeys(domain);
            result += `DKIM: Found (${keys.length} keys)\n`;
        } catch (error) {
            result += `DKIM: Not Found\n`;
        }

        return result;
    }

    definition(): Shared.FunctionDefinition{
        return {
            "name": 'dns_dmarc_spf_dkim_validation',
            "description": 'Use this tool to validate the Email DNS records of a domain. This tool will check the DMARC, SPF and DKIM records of the domain and return the status of each record.',
            "parameters": {
                "type": "object",
                "properties": {
                    "domain": {
                        "type": "string",
                        "description": "The domain to validate the Email DNS records."
                    }
                },
                "required": [
                    "domain"
                ]
            }
        }
    }

    getEmbed(args: Args) {
        return {
            "title": "Validation DNS DMARC, SPF et DKIM",
            "description": "Validation des enregistrements DNS Email du domaine " + args.domain,
        }
    }
}