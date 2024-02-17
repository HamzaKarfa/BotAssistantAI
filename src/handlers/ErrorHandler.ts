import {CloseEvent} from "discord.js";
import * as Sentry from "@sentry/node";

export default class ErrorHandler {

    static handle(error: Error | CloseEvent) {
        const err = error as NodeJS.ErrnoException;
        if (err.code === 'EPIPE') {
            console.error('EPIPE error occurred. Attempting to reconnect...');
        } else {
            console.error('An error occurred:', error);
        }

        Sentry.captureException(error);
    }

    static handleUncaughtException(error: Error) {
        console.error('Uncaught Exception:', error);
        // Handle uncaught exceptions

        Sentry.captureException(error);
    }

    static handleRejection(error: Error) {
        console.error('Unhandled Rejection:', error);
        // Handle unhandled promise rejections

        Sentry.captureException(error);
    }
}