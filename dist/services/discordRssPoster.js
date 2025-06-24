"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRssFeed = exports.setLastProcessedGuid = void 0;
const discord_js_1 = require("discord.js");
const rssService_1 = require("./rssService");
const fileUtils_1 = require("../utils/fileUtils");
const config_1 = require("../config");
let lastProcessedGuid = null;
function setLastProcessedGuid(guid) {
    lastProcessedGuid = guid;
}
exports.setLastProcessedGuid = setLastProcessedGuid;
async function checkRssFeed(client) {
    console.log(`Checking RSS feed: ${config_1.RSS_FEED_URL}`);
    try {
        const feed = await (0, rssService_1.parseFeed)(config_1.RSS_FEED_URL);
        const channel = client.channels.cache.get(config_1.TARGET_CHANNEL_ID);
        if (!channel) {
            console.error(`Error: Could not find channel with ID ${config_1.TARGET_CHANNEL_ID}. Make sure the bot has access and developer mode is on to copy correct ID.`);
            return;
        }
        if (!feed || !feed.items || !Array.isArray(feed.items)) {
            console.log("RSS feed items are empty or malformed. Skipping post.");
            return;
        }
        const latestGuidInCurrentFeed = feed.items.length > 0
            ? feed.items[0].guid ||
                feed.items[0].id ||
                feed.items[0].link ||
                `NO_GUID_${feed.items[0].title}_${Date.now()}`
            : null;
        if (lastProcessedGuid === null && latestGuidInCurrentFeed) {
            await (0, fileUtils_1.saveLastProcessedGuid)(latestGuidInCurrentFeed);
            lastProcessedGuid = latestGuidInCurrentFeed;
            console.log(`First run detected. Initializing lastProcessedGuid to ${lastProcessedGuid}. No posts will be sent immediately.`);
            return;
        }
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newItemsSinceLastCheck = [];
        for (const entry of feed.items) {
            const itemGuid = entry.guid ||
                entry.id ||
                entry.link ||
                `NO_GUID_${entry.title}_${Date.now()}`;
            const itemDate = entry.isoDate ? new Date(entry.isoDate) : null;
            if (itemGuid === lastProcessedGuid) {
                break;
            }
            if (itemDate && itemDate < oneDayAgo) {
                continue;
            }
            newItemsSinceLastCheck.push(entry);
        }
        newItemsSinceLastCheck.sort((a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime());
        if (newItemsSinceLastCheck.length > 0) {
            for (const entry of newItemsSinceLastCheck) {
                const title = entry.title || "No Title";
                const link = entry.link || "";
                const imageUrl = (0, rssService_1.getImageFromEntry)(entry);
                const embedDiscord = new discord_js_1.EmbedBuilder()
                    .setTitle(title)
                    .setURL(link)
                    .setColor(0x0099ff);
                if (imageUrl) {
                    embedDiscord.setImage(imageUrl);
                }
                if (entry.isoDate) {
                    embedDiscord.setTimestamp(new Date(entry.isoDate));
                }
                try {
                    await channel.send({ embeds: [embedDiscord] });
                }
                catch (discordError) {
                    console.error(`Failed to send message to Discord for '${title}':`, discordError);
                }
                await new Promise((resolve) => setTimeout(resolve, 3000));
            }
            if (latestGuidInCurrentFeed) {
                await (0, fileUtils_1.saveLastProcessedGuid)(latestGuidInCurrentFeed);
                lastProcessedGuid = latestGuidInCurrentFeed;
            }
        }
        else {
            console.log("No new RSS items found.");
        }
    }
    catch (error) {
        console.error("An unexpected error occurred during RSS check:", error);
        if (error.response) {
            console.error("RSS Parser Response Error:", error.response.status, error.response.headers, error.response.data);
        }
    }
}
exports.checkRssFeed = checkRssFeed;
