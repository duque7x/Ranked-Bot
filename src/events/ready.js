const fs = require("fs");
const path = require("path");
const { Client, Collection, ChannelType, PermissionsBitField, ActivityType, ActivityFlags, EmbedBuilder, Colors } = require("discord.js");
const BotClient = require("..");
const chalk = require('chalk');

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
  execute(event, client) {
    client.user.setActivity({
      name: "vem jogar na SWAG RANKED ",
      type: ActivityType.Custom,
    });
    
    console.log(chalk.bgBlue(`O bot está on! Com o nome ${this.client.user.username} e com ${this.client.guilds.cache.size} guildas`));
    this.client.guilds.cache.forEach(g => console.log(chalk.bgBlack(`Nome da guilda: ${g.name}. Membros ${g.members.cache.size}`)));
  }
  
};
