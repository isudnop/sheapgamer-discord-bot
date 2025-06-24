import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { parseFeed, getImageFromEntry } from "./rssService";
import { saveLastProcessedGuid } from "../utils/fileUtils";
import { TARGET_CHANNEL_ID, RSS_FEED_URL } from "../config";

let lastProcessedGuid: string | null = null;

export function setLastProcessedGuid(guid: string | null) {
  lastProcessedGuid = guid;
}

export async function checkRssFeed(client: Client) {
  console.log(`Checking RSS feed: ${RSS_FEED_URL}`);
  try {
    const feed = await parseFeed(RSS_FEED_URL);
    const channel = client.channels.cache.get(TARGET_CHANNEL_ID) as
      | TextChannel
      | undefined;
    if (!channel) {
      console.error(
        `Error: Could not find channel with ID ${TARGET_CHANNEL_ID}. Make sure the bot has access and developer mode is on to copy correct ID.`
      );
      return;
    }
    if (!feed || !feed.items || !Array.isArray(feed.items)) {
      console.log("RSS feed items are empty or malformed. Skipping post.");
      return;
    }
    const latestGuidInCurrentFeed =
      feed.items.length > 0
        ? feed.items[0].guid ||
          feed.items[0].id ||
          feed.items[0].link ||
          `NO_GUID_${feed.items[0].title}_${Date.now()}`
        : null;
    if (lastProcessedGuid === null && latestGuidInCurrentFeed) {
      await saveLastProcessedGuid(latestGuidInCurrentFeed);
      lastProcessedGuid = latestGuidInCurrentFeed;
      console.log(
        `First run detected. Initializing lastProcessedGuid to ${lastProcessedGuid}. No posts will be sent immediately.`
      );
      return;
    }
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newItemsSinceLastCheck: any[] = [];
    for (const entry of feed.items) {
      const itemGuid =
        entry.guid ||
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
    newItemsSinceLastCheck.sort(
      (a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime()
    );
    if (newItemsSinceLastCheck.length > 0) {
      for (const entry of newItemsSinceLastCheck) {
        const title = entry.title || "No Title";
        const link = entry.link || "";
        const imageUrl = getImageFromEntry(entry);
        const embedDiscord = new EmbedBuilder()
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
        } catch (discordError) {
          console.error(
            `Failed to send message to Discord for '${title}':`,
            discordError
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
      if (latestGuidInCurrentFeed) {
        await saveLastProcessedGuid(latestGuidInCurrentFeed);
        lastProcessedGuid = latestGuidInCurrentFeed;
      }
    } else {
      console.log("No new RSS items found.");
    }
  } catch (error: any) {
    console.error("An unexpected error occurred during RSS check:", error);
    if (error.response) {
      console.error(
        "RSS Parser Response Error:",
        error.response.status,
        error.response.headers,
        error.response.data
      );
    }
  }
}
