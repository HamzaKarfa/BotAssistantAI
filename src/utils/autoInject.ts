import {glob} from "glob";

import {fileURLToPath} from "node:url";
import path from "node:path";
import {debug} from "./log";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function autoInject(pathGlob: string, args?: any) {
    const fullPath = path.join(__dirname, "..",pathGlob)
    const objectFiles = glob.sync(fullPath.replace(/\\/g, '/'))
    debug("[AUTO INJECT]", fullPath, objectFiles)
    return await Promise.all(objectFiles.map(async (objectFile) => {
        const object = (await import("file://" + objectFile)).default
        return args ? new object(...args) : new object()
    }))
}