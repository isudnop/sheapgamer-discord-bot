import { Client } from "discord.js";
import { loadLastProcessedGuid } from "../utils/fileUtils";
import {
  checkRssFeed,
  setLastProcessedGuid,
} from "../services/discordRssPoster";
import { RSS_CHECK_INTERVAL_MS } from "../config";

export default async function onReady(client: Client) {
  console.log(`Logged in as ${client.user?.tag}!`);
  const lastGuid = await loadLastProcessedGuid();
  setLastProcessedGuid(lastGuid);
  if ((client as { rssCheckInterval?: NodeJS.Timeout }).rssCheckInterval) {
    clearInterval(
      (client as { rssCheckInterval?: NodeJS.Timeout }).rssCheckInterval
    );
  }
  (client as { rssCheckInterval?: NodeJS.Timeout }).rssCheckInterval =
    setInterval(() => checkRssFeed(client), RSS_CHECK_INTERVAL_MS);
  console.log(
    `Started RSS feed check loop every ${RSS_CHECK_INTERVAL_MS / 1000} seconds.`
  );
  checkRssFeed(client);
}
