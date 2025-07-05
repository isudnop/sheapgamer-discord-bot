import { Client } from "discord.js";
import { loadLastProcessedGuid } from "@/utils/fileUtils";
import {
  checkRssFeed,
  setLastProcessedGuid,
} from "@/services/discordRssPoster";
import { RSS_CHECK_INTERVAL_MS, DISCORD_BOT_ACT } from "@/config";

export default async function onReady(client: Client) {
  console.log(`Logged in as ${client.user?.tag}!`);
  const lastGuid = await loadLastProcessedGuid();
  setLastProcessedGuid(lastGuid);

  client.user?.setActivity(DISCORD_BOT_ACT);

  const checkFeed = async () => {
    await checkRssFeed(client);
    setTimeout(checkFeed, RSS_CHECK_INTERVAL_MS);
  };

  checkFeed();

  console.log(
    `Started RSS feed check loop every ${RSS_CHECK_INTERVAL_MS / 1000} seconds.`
  );
}
