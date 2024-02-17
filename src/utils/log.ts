import colors from 'colors';
import config from "../config";

enum LOG_LEVEL {
    debug,
    info,
    warn,
    error,
    fatal
}
const COLOR_BY_LEVEL = {
    [LOG_LEVEL.debug]: colors.grey,
    [LOG_LEVEL.info]: colors.blue,
    [LOG_LEVEL.warn]: colors.yellow,
    [LOG_LEVEL.error]: colors.red,
    [LOG_LEVEL.fatal]: colors.bgRed,
}

function colorize(text: string, level: string) {
    // @ts-ignore
    return COLOR_BY_LEVEL[LOG_LEVEL[level]](text);
}

function log(level: string, ...args: any) {
    if (!(level in LOG_LEVEL)) throw new Error(`Invalid log level ${level}`);

    // @ts-ignore
    if (LOG_LEVEL[level] < LOG_LEVEL[config.LOG_LEVEL]) return;

    const date = new Date().toISOString();
    const text = colorize(`[${date}] [${level.toUpperCase()}]`, level)
    console.log(text, ...args.map((arg: any) => colorize(arg, level)));
}

export function debug(...args: any[]) { log('debug', ...args); }
export function info(...args: any[]) { log('info', ...args); }
export function warn(...args: any[]) { log('warn', ...args); }
export function error(...args: any[]) { log('error', ...args); }
export function fatal(...args: any[]) { log('fatal', ...args); }