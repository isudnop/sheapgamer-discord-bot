import dotenv from "dotenv";
dotenv.config();

if (!process.env.DISCORD_BOT_TOKEN) {
  throw new Error("DISCORD_BOT_TOKEN is not set");
}

if (!process.env.DISCORD_CHANNEL_ID) {
  throw new Error("DISCORD_CHANNEL_ID is not set");
}

if (!process.env.RSS_FEED_URL) {
  throw new Error("RSS_FEED_URL is not set");
}

export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string;
export const TARGET_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID as string;
export const RSS_FEED_URL =
  process.env.RSS_FEED_URL || "https://rss.app/feeds/COiTZRnT26oDqrJf.xml";
export const RSS_CHECK_INTERVAL_MS = 900000; // 15 minutes
export const GUID_FILE = "last_processed_guid.json";
