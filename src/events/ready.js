const fs = require("fs");
const path = require("path");
const { Client, Collection, ChannelType, PermissionsBitField } = require("discord.js");
const BotClient = require("..");

module.exports = class ReadyEvent {
  /**
   * @param {BotClient} client
   */
  constructor(client) {
    this.name = "ready";
    this.client = client;
    this.once = true; // Run only once
  }

  execute(event) {
    // Dynamically load command files
    const commandsPath = path.join(__dirname, "..", "commands");
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const commandPath = path.join(commandsPath, file);

      const command = require(commandPath);
      this.client.commands.set(command.name, command);
    }

    console.log(`Logged in as ${this.client.user.tag}`);
  }
};
