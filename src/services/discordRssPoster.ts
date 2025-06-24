import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { parseFeed, getImageFromEntry, FeedEntry } from "@/services/rssService";
import { saveLastProcessedGuid } from "@/utils/fileUtils";
import { delay } from "@/utils/delay";
import { TARGET_CHANNEL_ID, RSS_FEED_URL } from "@/config";

let lastProcessedGuid: string | null = null;

/**
 * Sets the last processed GUID for RSS tracking.
 * @param guid The GUID to set as last processed.
 */
export function setLastProcessedGuid(guid: string | null) {
  lastProcessedGuid = guid;
}

/**
 * Extracts a unique identifier (GUID) from a feed entry.
 * Falls back to a synthetic GUID if none is present.
 * @param entry The feed entry.
 * @returns The extracted or generated GUID.
 */
function extractGuid(entry: FeedEntry): string {
  return (
    (entry.guid as string) ||
    (entry.id as string) ||
    (entry.link as string) ||
    `NO_GUID_${entry.title ?? "unknown"}_${Date.now()}`
  );
}

/**
 * Posts new RSS feed items to the specified Discord channel.
 * @param channel The Discord text channel.
 * @param items The new feed entries to post.
 */
async function postNewItemsToChannel(channel: TextChannel, items: FeedEntry[]) {
  for (const entry of items) {
    const title = (entry.title as string) || "No Title";
    const link = (entry.link as string) || "";
    const imageUrl = getImageFromEntry(entry);
    const embedDiscord = new EmbedBuilder()
      .setTitle(title)
      .setURL(link)
      .setColor(0x0099ff);
    if (imageUrl) {
      embedDiscord.setImage(imageUrl);
    }
    if (entry.isoDate) {
      embedDiscord.setTimestamp(new Date(entry.isoDate as string));
    }
    try {
      await channel.send({ embeds: [embedDiscord] });
    } catch (discordError) {
      console.error(
        `Failed to send message to Discord for '${title}':`,
        discordError
      );
    }
    await delay(3000);
  }
}

/**
 * Checks the RSS feed for new items and posts them to Discord if found.
 * @param client The Discord client instance.
 */
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
    if (!feed?.items || !Array.isArray(feed.items)) {
      console.log("RSS feed items are empty or malformed. Skipping post.");
      return;
    }
    const latestGuidInCurrentFeed =
      feed.items.length > 0 ? extractGuid(feed.items[0] as FeedEntry) : null;
    if (lastProcessedGuid === null && latestGuidInCurrentFeed) {
      await saveLastProcessedGuid(latestGuidInCurrentFeed);
      lastProcessedGuid = latestGuidInCurrentFeed;
      console.log(
        `First run detected. Initializing lastProcessedGuid to ${lastProcessedGuid}. No posts will be sent immediately.`
      );
      return;
    }
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newItemsSinceLastCheck: FeedEntry[] = [];
    for (const entry of feed.items as FeedEntry[]) {
      const itemGuid = extractGuid(entry);
      const itemDate = entry.isoDate ? new Date(entry.isoDate as string) : null;
      if (itemGuid === lastProcessedGuid) {
        break;
      }
      if (itemDate && itemDate < oneDayAgo) {
        continue;
      }
      newItemsSinceLastCheck.push(entry);
    }
    newItemsSinceLastCheck.sort((a, b) => {
      const aDate =
        typeof a.isoDate === "string" ? new Date(a.isoDate).getTime() : 0;
      const bDate =
        typeof b.isoDate === "string" ? new Date(b.isoDate).getTime() : 0;
      return aDate - bDate;
    });
    if (newItemsSinceLastCheck.length > 0) {
      await postNewItemsToChannel(channel, newItemsSinceLastCheck);
      if (latestGuidInCurrentFeed) {
        await saveLastProcessedGuid(latestGuidInCurrentFeed);
        lastProcessedGuid = latestGuidInCurrentFeed;
      }
    } else {
      console.log("No new RSS items found.");
    }
  } catch (error: unknown) {
    console.error("An unexpected error occurred during RSS check:", error);
    if (typeof error === "object" && error && "response" in error) {
      const err = error as {
        response?: { status?: unknown; headers?: unknown; data?: unknown };
      };
      if (err.response) {
        console.error(
          "RSS Parser Response Error:",
          err.response.status,
          err.response.headers,
          err.response.data
        );
      }
    }
  }
}
