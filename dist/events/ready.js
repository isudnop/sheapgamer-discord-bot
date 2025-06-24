"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fileUtils_1 = require("../utils/fileUtils");
const discordRssPoster_1 = require("../services/discordRssPoster");
const config_1 = require("../config");
async function onReady(client) {
    console.log(`Logged in as ${client.user?.tag}!`);
    const lastGuid = await (0, fileUtils_1.loadLastProcessedGuid)();
    (0, discordRssPoster_1.setLastProcessedGuid)(lastGuid);
    if (client.rssCheckInterval) {
        clearInterval(client.rssCheckInterval);
    }
    client.rssCheckInterval = setInterval(() => (0, discordRssPoster_1.checkRssFeed)(client), config_1.RSS_CHECK_INTERVAL_MS);
    console.log(`Started RSS feed check loop every ${config_1.RSS_CHECK_INTERVAL_MS / 1000} seconds.`);
    (0, discordRssPoster_1.checkRssFeed)(client);
}
exports.default = onReady;
