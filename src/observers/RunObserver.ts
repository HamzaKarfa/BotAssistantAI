import {debug} from "../utils/log";
import {MessageContentText} from "openai/resources/beta/threads";
import {ToolCall} from "../executors/ToolCallExecutor";

type Listener = (...args: any[]) => void;
export enum Events {
    MESSAGE_TEXT = 'messageText',
    MESSAGE_FILE = 'messageFile',
    TOOLS_CALL = 'toolsCall',
    STEP_DISCOVERY = 'stepDiscovery',
    RUN_FAILED = 'runFailed',
}

export default class RunObserver {

    private readonly listeners: { [event: string]: Listener[] } = {};

    constructor() {
        this.listeners = {};
    }

    onMessageContentText(callback: (content: MessageContentText) => Promise<void>) {
        this.on(Events.MESSAGE_TEXT, callback);
        return this
    }

    onMessageContentFile(callback: (fileName: string, response: Response) => Promise<void>) {
        this.on(Events.MESSAGE_FILE, callback);
        return this
    }

    onToolsCall(callback: (toolCalls: ToolCall[]) => Promise<void>) {
        this.on(Events.TOOLS_CALL, callback);
        return this
    }
    on(event: string, callback: Listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }

        this.listeners[event].push(callback);

        debug(`[EVENT] ${event} registered`)

        return this;
    }

    emit(event: string, ...args: any[]) {
        if (!this.listeners[event]) {
            return;
        }

        debug(`[EVENT] emitted ${event} ${JSON.stringify(args)}`)

        this.listeners[event].forEach((callback) => {
            callback(...args);
        });
    }

    onRunFailed(param: (run) => Promise<void>) {
        this.on(Events.RUN_FAILED, param);
        return this
    }
}