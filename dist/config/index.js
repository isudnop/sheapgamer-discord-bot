"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GUID_FILE = exports.RSS_CHECK_INTERVAL_MS = exports.RSS_FEED_URL = exports.TARGET_CHANNEL_ID = exports.DISCORD_BOT_TOKEN = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
exports.TARGET_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
exports.RSS_FEED_URL = process.env.RSS_FEED_URL || "https://rss.app/feeds/COiTZRnT26oDqrJf.xml";
exports.RSS_CHECK_INTERVAL_MS = 900000; // 15 minutes
exports.GUID_FILE = "last_processed_guid.json";
