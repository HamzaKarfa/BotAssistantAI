import {RunCreateParams} from "openai/src/resources/beta/threads/runs/runs";
import Tool from "../interfaces/Tool";
import MultiToolUseParallel from "../tools/MultiToolUseParallel";
import {ToolsCollection} from "../executors/ToolCallExecutor";

export default class OpenAIToolFunctionFactory {
    static fromToolsCollection(tools: ToolsCollection) {

        return [
            //{type: "retrieval"},
            //{type: "code_interpreter"},
            ...Object.values(tools).filter((tool) => !(tool instanceof MultiToolUseParallel)).map((tool) => ({
                type: "function",
                function: tool.definition(),
            } as RunCreateParams.AssistantToolsFunction))
        ];
    }
}