const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
const { inspect } = require('util');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('Este comando executa o código inserido pelo user!')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('Código a ser executado')
        .setRequired(true)
    ),

  /**
   * @param {import("discord.js").CommandInteraction} interaction
   */
  async execute(interaction) {
    const authorizedUserId = '877598927149490186';

    // Check if the user is authorized
    if (interaction.user.id !== authorizedUserId) {
      return interaction.reply("You are not authorized to use this command.");
    }

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
