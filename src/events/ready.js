const fs = require("fs");
const path = require("path");
const { Client, Collection, ChannelType, PermissionsBitField, ActivityType, ActivityFlags, EmbedBuilder, Colors } = require("discord.js");
const BotClient = require("..");
const chalk = require('chalk');
const scheduleDailyMessage = require("../utils/functions/scheduleMessage");
const allTimeRankReturned = require("../utils/functions/allTimeRankReturned");

module.exports = class ReadyEvent {
  /**
   * @param {BotClient} client
   */
  constructor(client) {
    this.name = "ready";
    this.client = client;
    this.once = true; // Run only once
  }
  /**
   * 
   * @param {ReadyEvent} event 
   * @param {BotClient} client 
   */
  async execute(event, client) {
    client.user.setActivity({
      name: "discord.gg/swagranked",
      type: ActivityType.Custom,
    });
    const guild = client.guilds.cache.get("1336809872884371587");

    console.log(chalk.bgBlue(`O bot está on! Com o nome ${this.client.user.username} e com ${this.client.guilds.cache.size} guildas`));
    this.client.guilds.cache.forEach(g => console.log(chalk.bgBlack(`Nome da guilda: ${g.name}. Membros ${g.members.cache.size}`)));

    scheduleDailyMessage(client, "1359980755639468094", "1361094577192308798",
      { content: "", embeds: [(await allTimeRankReturned(guild)).generateEmbed()] },
    )
  }

};
