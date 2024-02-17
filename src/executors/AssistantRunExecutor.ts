import {MessageContentImageFile, MessageContentText} from "openai/resources/beta/threads";
import ToolCallExecutor from "./ToolCallExecutor";
import {
    FunctionToolCall,
    MessageCreationStepDetails,
    Run,
    RunStep,
    ToolCallsStepDetails
} from "openai/resources/beta/threads/runs";
import RunObserver, {Events} from "../observers/RunObserver";
import OpenAIConnector from "../connectors/OpenAIConnector";
import {Thread} from "openai/resources/beta";
import {debug, info, warn} from "../utils/log";
import {sleep} from "openai/core";

export default class AssistantRunExecutor {
    private discoveredRunStepsById: { [key: string]: boolean } = {};

    constructor(
        private readonly thread: Thread,
        private readonly connector: OpenAIConnector,
        private readonly observer: RunObserver,
        private readonly toolCallExecutor: ToolCallExecutor,
    ) {
    }

    async execute(run: Run) {
        let pollsCount = 0
        let lastSteps: Promise<boolean>[] = []
        let failsCount = 0
        do {
            run = await this.connector.retrieveRun(this.thread.id, run.id)
            debug("[RUN POLLING " + run.id + "]", run.status)

            if(["failed", "expired", "cancelled"].includes(run.status)) {
                warn("[RUN FAILED]", run)
                failsCount++
                if(failsCount > 5) {
                    this.observer.emit(Events.RUN_FAILED, run)
                    throw new Error('Run failed multiple times');
                    return false
                }
            }

            const awaitableSteps: Array<Promise<any>> = [sleep(2000)]

            if (run.status === 'requires_action' && run.required_action) {
                debug("[REQUIRED ACTION]")
                await this.actOnRequiredAction(run)
            }

            const steps = await this.connector.retrieveRunSteps(this.thread.id, run.id)

            debug("[STEPS RETRIEVED]", steps.data.length)

            // Lancer une erreur pour tester
            // throw new Error('Test error');

            lastSteps = []
            for (const step of steps.data) {
                if (!this.discoveredRunStepsById[step.id]) {
                    this.discoveredRunStepsById[step.id] = true

                    info("[STEP DISCOVERED " + step.id + "]", step.status, step.step_details.type)

                    this.observer.emit(Events.STEP_DISCOVERY, step)

                    lastSteps.push(this.observeStep(step, run))
                }
            }

            await Promise.all(awaitableSteps)
            debug("[STEPS POLLING COMPLETE] ")
            pollsCount++
            if (pollsCount > 1000) {
                return false
            }
        } while (run.status !== 'completed');
        await Promise.all(lastSteps)
    }

    private async observeStep(step: RunStep, run: Run) {
        let toolsCallCompleted = false
        const getToolCalls = (step: RunStep) => (step.step_details as ToolCallsStepDetails).tool_calls
        const hasToolCalls = (step: RunStep) => step.step_details.type === 'tool_calls' && getToolCalls(step).length > 0
        const checkToolCalls = (step: RunStep) => {
            if (hasToolCalls(step) && !toolsCallCompleted) {
                debug("[TOOLS CALL]", getToolCalls(step).map((toolCall) => {
                    if (toolCall.type === 'function') {
                        return toolCall.function.name + " : " + toolCall.function.arguments
                    }
                    return toolCall.type
                }))
                this.observer.emit(Events.TOOLS_CALL, getToolCalls(step))
                if (step.status === "completed") {
                    toolsCallCompleted = true
                }
            }
        }

        checkToolCalls(step)

        let pollsCount = 0
        while (step.status !== 'completed') {
            await sleep(2000)
            step = await this.connector.retrieveRunStep(this.thread.id, run.id, step.id)
            debug("[STEP POLLING " + step.id + "]", step.status, step.step_details.type)
            pollsCount++
            if (pollsCount > 100) {
                return false
            }
        }

        checkToolCalls(step)

        if (step.step_details.type === 'message_creation') {
            await this.emitMessageCreationStep(step.step_details)
        }

        return true
    }

    protected async emitMessageFile(fileId: string): Promise<void> {
        const [file, fileContent] = await Promise.all([
            this.connector.retrieveFile(fileId),
            this.connector.retrieveFileContent(fileId)
        ])
        this.observer.emit(Events.MESSAGE_FILE, file.filename, fileContent)
    }

    private async actOnRequiredAction(run: Run) {
        if (!run.required_action) {
            return this
        }
        const functionToolCalls = run.required_action.submit_tool_outputs.tool_calls
            .filter((toolCall) => toolCall.type === 'function') as FunctionToolCall[]

        const toolCallOutputs = await this.toolCallExecutor.execute(functionToolCalls)

        if (toolCallOutputs.length > 0) {
            await this.connector.submitToolOutputs(this.thread.id, run.id, toolCallOutputs)
        }

        return this
    }

    private async emitMessageCreationStep(step_details: MessageCreationStepDetails) {
        const messageId = (step_details as MessageCreationStepDetails).message_creation.message_id
        const aiMessage = await this.connector.retrieveMessage(this.thread.id, messageId)

        for (const content of aiMessage.content) {
            if (content.type === 'text') {
                const aiTextMessage = content as MessageContentText
                const text = aiTextMessage.text
                const annotations = text.annotations;

                debug("EMIT TEXT", text)
                this.observer.emit(Events.MESSAGE_TEXT, aiTextMessage)

                if (annotations.length) {
                    await Promise.all(annotations.map(async (annotation) => {
                        if (annotation.type === 'file_path') {
                            debug("EMIT FILE")
                            await this.emitMessageFile(annotation.file_path.file_id)
                        }
                    }))
                }
            } else if (content.type === 'image_file') {
                const aiImageMessage = content as MessageContentImageFile
                debug("EMIT IMAGE MESSAGE")
                await this.emitMessageFile(aiImageMessage.image_file.file_id)
            }
        }
    }
};