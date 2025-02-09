const {
  Collection,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  EmbedType,
  Message,
} = require("discord.js");
const BotClient = require("..");

module.exports = class MessageEvent {
  /**
   *
   * @param {Client} client
   */
  constructor(client) {
    this.name = "messageCreate";
  }
  /**
   * 
   * @param {Message} message 
   * @param {BotClient} cl
   * @returns 
   */
  execute(message, cl) {
    const prefix = "!";
    if (!message.content.startsWith(prefix)) return;

    // Get the command and arguments
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift();
    const command = cl.commands.get(commandName);

    // Find the command in the Collection

    if (!cl.commands) {
      console.error('Commands collection is not defined!');
      return;
    }
    if (command) {
      command.execute(message, args, cl);
    }
  }
};
