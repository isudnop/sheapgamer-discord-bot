# **SheapGamer RSS Feed Discord Bot**

This Discord bot automatically fetches the latest articles from a specified RSS feed and posts them to a designated Discord channel

This purpose to read RSS feed from SheapGamer channel but you can configure it
to read from any RSS feed your desired.

## **Features** :rocket:

* **Automated RSS Fetching:** Periodically checks a configurable RSS feed URL (default: https://rss.app/feeds/COiTZRnT26oDqrJf.xml) which is SheapGamer RSS
* **Persistent Tracking:** Uses a local last\_processed\_guid.json file to store the GUID (Globally Unique Identifier) of the last successfully posted RSS item, preventing duplicate posts across bot restarts.  
* **One-Day Filter:** Ignores any RSS posts that are older than 24 hours to prevent posting outdated content.  
* **Chronological Posting:** New items are posted in ascending order by date, ensuring the oldest new content appears first.  
* **Concise Discord Embeds:** Each new post is formatted as a Discord embed containing only:  
  * The article's **Title** (clickable, linking to the original article).  
  * The article's **Featured Image** (if available in the RSS feed).  
  * A **Timestamp** (from the RSS item's publication date).  

## **Getting Started**

Follow these steps to set up and run your Discord bot.

### **Prerequisites** :wrench:

* **Node.js (v18.x or higher recommended):** Download and install from [nodejs.org](https://nodejs.org/). This includes npm.  
* A **Discord Account** and a **Discord Server** where you have permissions to manage channels and invite bots.

### **Discord Bot Setup** 🤖

1. **Create a New Application:**  
   * Go to the [Discord Developer Portal](https://discord.com/developers/applications).  
   * Click "New Application" and give your bot a name (e.g., SheapGamer RSS Bot).  
2. **Add a Bot User:**  
   * Navigate to the "Bot" tab on the left sidebar.  
   * Click "Add Bot" and then "Yes, do it\!".  
3. **Copy Bot Token:**  
   * Under the "Token" section, click "Copy". **DO NOT LEAK YOUR TOKEN ANYWHERE\!** 
   keep it in note or something
4. **Configure Gateway Intents:**  
   * Scroll down to "Privileged Gateway Intents".  
   * For this bot's current functionality, you likely **don't need** to enable "PRESENCE INTENT" or "MESSAGE CONTENT INTENT". If you plan to add commands later, you might need to enable Message Content Intent.  
5. **Invite Your Bot to Your Server:**  
   * Go to the "OAuth2" tab, then "URL Generator".  
   * Under "SCOPES", select bot.  
   * Under "BOT PERMISSIONS", select at least this permission:  
     * Send Messages  
     * Embed Links (Crucial for the rich messages)  
   * Copy the generated URL. Paste it into your browser, select the server you want the bot to join, and authorize it.  
6. **Get Channel ID:**  
   * In your Discord server, go to "User Settings" (bottom left, gear icon).  
   * Navigate to "App Settings" \-\> "Advanced".  
   * Enable "Developer Mode".  
   * Right-click on the Discord channel where you want the bot to post updates, and select "Copy ID". This is your DISCORD\_CHANNEL\_ID.

### **Project Setup** :computer:

1. **Clone this project** 

2. **Install Dependencies:**  
   `$ npm install discord.js rss-parser dotenv`

3. **Create .env File froom .env.example :**  
   * clone .env.example to .env, then add this variable
    ```
     DISCORD_BOT_TOKEN="YOUR_BOT_TOKEN_HERE"  
     DISCORD_CHANNEL_ID="YOUR_CHANNEL_ID_HERE"  
     RSS_FEED_URL="https://rss.app/feeds/COiTZRnT26oDqrJf.xml"
    ```

    * **Replace YOUR\_BOT\_TOKEN\_HERE** with the token you copied from Discord Developer Portal.  
    * **Replace YOUR\_CHANNEL\_ID\_HERE** with the channel ID you copied from your Discord server.  
    * You can optionally change RSS\_FEED\_URL here if you want to use a different feed.

### **Running the Bot** :robot:

Simply run to start bot

`$ node index.js`

The bot should now log in to Discord. You will see console messages indicating that it's checking the RSS feed and either posting new items or reporting that no new eligible items were found.

### **License**

This project is licensed under the MIT License \- see the LICENSE file (if you choose to create one) for details. (Typically, for small open-source projects, a LICENSE file is included in the root directory, containing the full text of the chosen license).

## TypeScript Migration

This project has been migrated to TypeScript and now uses a modern project structure:

- Source code is in `src/`
- Build output is in `dist/`
- To build: `npm run build`
- To run: `npm start`
- For development: `npm run dev`

## Project Structure

- `src/config/` - Configuration files and environment management
- `src/commands/` - Discord command modules
- `src/events/` - Discord event handlers
- `src/services/` - Reusable services (e.g., RSS, database)
- `src/utils/` - Utility functions

## Environment Variables

Copy `.env-example` to `.env` and fill in your Discord bot token, channel ID, and RSS feed URL.
