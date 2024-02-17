import Tool from "../interfaces/Tool.js";
import * as Shared from "openai/src/resources/shared";
import {Gitlab as GitlabSdk} from '@gitbeaker/node';
import config from "../config";
import {EmbedData} from "discord.js";

type GitlabArgs = {
    project: string,
    branch?: string,
    query?: string,
    file?: string
}

export default class Gitlab implements Tool {
    private gitlabClient;

    constructor() {
        this.gitlabClient = new GitlabSdk({
            token: config.GITLAB_TOKEN
        });
    }

    async handle(args: GitlabArgs): Promise<string> {
        const branch = args.branch || 'master'
        let output = "";

        if(args.query) {
            output = await this.globalSearch(args.query)
        }
        else if(args.file) {
            try {
                const project = await this.gitlabClient.Projects.show(args.project);
                const file = await this.gitlabClient.RepositoryFiles.show(args.project, args.file, branch)
                output = file.content + `\n\nURL: ${project.web_url}/-/blob/${branch}/${args.file}`
            }
            catch (e) {
                output = "Fichier non trouvé"
            }
        }

        return output
    }

    async globalSearch(searchTerm: string, scope: string = 'projects'): Promise<string> {
        const results = await this.gitlabClient.Search.all(scope, searchTerm);

        if (results && results.length > 0) {
            return results.map(item => `Title: ${item.title || item.name}\nDescription: ${item.description || ''}\nURL: ${item.web_url}`).join('\n\n');
        }
        return 'Aucun résultat trouvé';
    }

    definition(): Shared.FunctionDefinition{
        return {
            "name": "gitlab",
            "description": "Search and Retrieve files or code in a Gitlab repository",
            "parameters": {
                "type": "object",
                "properties": {
                    "project": {
                        "type": "string",
                        "description": "The project to search in"
                    },
                    "branch": {
                        "type": "string",
                        "description": "The branch to search in. Defaults to master"
                    },
                    "query": {
                        "type": "string",
                        "description": "The query to search for. If not provided, the file parameter should be used instead."
                    },
                    "file": {
                        "type": "string",
                        "description": "The file to analyze. Ignored if the query parameter is provided."
                    }
                },
                "required": ["project"]
            }
        }
    }

    getEmbed(args: GitlabArgs): EmbedData {
        const embed: EmbedData = {
            "title": "💾 Gitlab",
            "description": "Je recherche dans Gitlab",
        }

        if(args.project) {
            embed.footer = {
                text: `Projet: ${args.project}`
            }
            if(args.branch) {
                embed.footer.text += ` | Branche: ${args.branch}`
            }
            if(args.file) {
                embed.footer.text += ` | Fichier: ${args.file}`
            }
            if(args.query) {
                embed.footer.text += ` | Recherche: ${args.query}`
            }
        }

        return embed
    }
}