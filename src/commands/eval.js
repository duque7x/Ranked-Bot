const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, ChannelType, PermissionFlagsBits } = require('discord.js');
const { inspect } = require('util');
const Bet = require("../structures/database/match");
const User = require("../structures/database/User");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('Este comando executa o código inserido pelo user!')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('Código a ser executado')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  /**
   * @param {import("discord.js").CommandInteraction} interaction
   */
  async execute(interaction) {
    // Get the code to evaluate
    const code = interaction.options.getString('code');
    if (!code) return interaction.reply("Please provide code to evaluate.");

    try {
      // Evaluate the code
      let evaled = eval(code);

      // Format the output
      if (typeof evaled !== 'string') {
        evaled = inspect(evaled);
      }

      // Send the output back (only once)
      const output = `\`\`\`js\n${evaled}\n\`\`\``;
      await interaction.reply(output);

    } catch (error) {
      // Send any errors back (only once)
      await interaction.reply(`Error: ${error}`);
    }
  },
};
