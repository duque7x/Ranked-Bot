const { SlashCommandBuilder } = require('@discordjs/builders');
const { log } = require('console');
const { PermissionsBitField, CategoryChannel } = require('discord.js');
const { inspect } = require('util');

module.exports = {
  name: "eval",
  usage: "`!eval CODE`",
  description: "Este comando executa o código inserido pelo user!",
  users: ["877598927149490186"],
  /**
   * 
   * @param {import("discord.js").Message} message 
   * @param {import("discord.js").Client} client 
   * @returns 
   */
  async execute(message, args, client) {
    const authorizedUserId = '877598927149490186';

    // Check if the user is authorized
    if (message.author.id !== authorizedUserId) {
      return message.reply("You are not authorized to use this command.");
    }

    // Get the code to evaluate
    const code = args[0];
    if (!code) return message.reply("Please provide code to evaluate.");

    try {
      // Evaluate the code
      let evaled = eval(code);

      // Format the output
      if (typeof evaled !== 'string') {
        evaled = inspect(evaled);
      }

      // Send the output back (only once)
      const output = `\`\`\`js\n${evaled}\n\`\`\``;
      await message.reply(output);  // Send only once



    } catch (error) {
      // Send any errors back (only once)
      await message.reply(`Error: ${error}`);
    }
  },
};
