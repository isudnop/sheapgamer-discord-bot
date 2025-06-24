"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_1 = require("./config");
const ready_1 = __importDefault(require("./events/ready"));
const client = new discord_js_1.Client({
    intents: [discord_js_1.GatewayIntentBits.Guilds],
});
client.on("ready", () => (0, ready_1.default)(client));
client.on("error", (error) => {
    console.error("Discord client encountered an error:", error);
});
process.on("unhandledRejection", (error) => {
    console.error("Unhandled promise rejection:", error);
});
if (config_1.DISCORD_BOT_TOKEN) {
    client.login(config_1.DISCORD_BOT_TOKEN);
}
else {
    console.error("Error: DISCORD_BOT_TOKEN environment variable not set. Please set it before running the bot.");
}
