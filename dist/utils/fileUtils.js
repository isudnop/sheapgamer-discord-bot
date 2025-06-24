"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveLastProcessedGuid = exports.loadLastProcessedGuid = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
async function loadLastProcessedGuid() {
    try {
        const data = await promises_1.default.readFile(path_1.default.resolve(process.cwd(), config_1.GUID_FILE), "utf8");
        return JSON.parse(data).lastGuid;
    }
    catch (error) {
        if (error.code === "ENOENT") {
            return null;
        }
        else {
            throw error;
        }
    }
}
exports.loadLastProcessedGuid = loadLastProcessedGuid;
async function saveLastProcessedGuid(guid) {
    await promises_1.default.writeFile(path_1.default.resolve(process.cwd(), config_1.GUID_FILE), JSON.stringify({ lastGuid: guid }), "utf8");
}
exports.saveLastProcessedGuid = saveLastProcessedGuid;
