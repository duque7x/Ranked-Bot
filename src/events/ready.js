const fs = require("fs");
const path = require("path");
const { Client, Collection, ChannelType, PermissionsBitField, ActivityType, ActivityFlags } = require("discord.js");
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

  execute(event, client) {
    client.user.setActivity({
      name: "apostando mais de 100€ em live",
      type: ActivityType.Custom,
    });

    console.log(`Logged in as ${this.client.user.tag}`);
  }
};
