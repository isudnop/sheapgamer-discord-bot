import { Client, GatewayIntentBits } from "discord.js";
import { DISCORD_BOT_TOKEN } from "./config";
import onReady from "./events/ready";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.on("ready", () => onReady(client));

client.on("error", (error) => {
  console.error("Discord client encountered an error:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

if (DISCORD_BOT_TOKEN) {
  client.login(DISCORD_BOT_TOKEN);
} else {
  console.error(
    "Error: DISCORD_BOT_TOKEN environment variable not set. Please set it before running the bot."
  );
}
