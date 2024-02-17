import OpenAI from "openai";
import {ThreadCreateParams} from "openai/src/resources/beta/threads/threads";
import {Assistant, Thread} from "openai/resources/beta";
import AssistantRunExecutor from "../executors/AssistantRunExecutor.js";
import {RunSubmitToolOutputsParams} from "openai/src/resources/beta/threads/runs/runs";
import {ToolsCollection} from "../executors/ToolCallExecutor";
import OpenAIToolFunctionFactory from "../factories/OpenAIToolFunctionFactory";
import config from "../config";
import Tool from "../interfaces/Tool";
import {debug, fatal, info} from "../utils/log";

export default class OpenAIConnector {
    private readonly client: OpenAI;

    constructor(token: string) {
        this.client = new OpenAI({apiKey: token});
    }

    async run(assistantId: string,thread: Thread, instructions: string, tools: ToolsCollection) {
        return this.client.beta.threads.runs.create(thread.id, {
            assistant_id: assistantId,
            instructions,
            tools: OpenAIToolFunctionFactory.fromToolsCollection(tools)
        })
    }

    async deleteThread(threadId: string) {
        return this.client.beta.threads.del(threadId)
    }

    async upsertThread(openAIThreadMessages: ThreadCreateParams.Message[]) {
        return this.client.beta.threads.create({
            messages: openAIThreadMessages,
        })
    }

    async retrieveRun(threadId: string, runId: string) {
        return this.client.beta.threads.runs.retrieve(threadId, runId)
    }

    async retrieveRunSteps(threadId: string, runId: string) {
        return this.client.beta.threads.runs.steps.list(threadId, runId)
    }

    async retrieveRunStep(threadId: string, runId: string, stepId: string) {
        return this.client.beta.threads.runs.steps.retrieve(threadId, runId, stepId)
    }

    async retrieveMessage(threadId: string, messageId: string) {
        return this.client.beta.threads.messages.retrieve(threadId, messageId)
    }

    async retrieveFile(fileId: string) {
        return this.client.files.retrieve(fileId)
    }

    async retrieveFileContent(fileId: string) {
        return this.client.files.content(fileId)
    }

    async chatCompletion(messages: any) {
        return this.client.chat.completions.create({
            messages: messages,
            model: "gpt-4-turbo-preview",
            temperature: 0.9,
            frequency_penalty: 0,
            presence_penalty: 0,
          });
    }

    /**
     * @param threadId 
     * @param runId 
     * @param toolCallOutputs 
     * @returns 
     */
    async submitToolOutputs(threadId: string, runId: string, toolCallOutputs: RunSubmitToolOutputsParams.ToolOutput[]) {
        return this.client.beta.threads.runs.submitToolOutputs(threadId, runId, {
            tool_outputs: toolCallOutputs
        })
    }

    async createAssistantFromTemplate(assistantId: string) {
        const templateAssistant = await this.client.beta.assistants.retrieve(assistantId)
        const keysToKeep = ["description", "organization", "instructions", "file_ids"]
        const newAssistantParams: Partial<Assistant> = Object.fromEntries(
            Object.entries(templateAssistant).filter(([key]) => keysToKeep.includes(key))
        )

        return this.client.beta.assistants.create({
            ...newAssistantParams,
            name: templateAssistant.name + " - " + new Date().toISOString(),
            model: templateAssistant.model,
        })
    }

    async deleteAssistant(id: string) {
        return this.client.beta.assistants.del(id)
    }

    async getAllAssistantsPages() {
        return this.client.beta.assistants.list()
    }

    async getChatCompletion(systemMessage: string | null = null) {
        debug("getChatCompletion");
        debug(systemMessage);
        const completion = await this.client.chat.completions.create({
            messages: [{
                role: "system",
                content: systemMessage ? systemMessage : ""
            }],
            model: "gpt-4-1106-preview",
            response_format: { "type": "json_object" },
            temperature: 0,
        })
        info("chat completion: ", completion.choices[0].message.content);
        return completion.choices[0].message.content;
    }
}