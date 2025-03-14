const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('apagarmensagens')
    .setDescription('Apaga um número específico de mensagens do canal atual.')
    .addIntegerOption(option =>
      option.setName('quantidade')
        .setDescription('Número de mensagens a serem apagadas (máx. 100)')
        .setRequired(true)
    )
    .addChannelOption(option =>
        option.setName('canal')
          .setDescription('Canal para as mensagens serem deletadas')
          .setRequired(true)
      )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  /**
   * @param {import("discord.js").CommandInteraction} interaction
   */
  async execute(interaction) {
    const quantidade = interaction.options.getInteger('quantidade');
    const channel = interaction.options.getChannel("canal") ?? interaction.channel;
    
    if (quantidade < 1 || quantidade > 100) {
      return interaction.reply({ content: 'O número deve estar entre 1 e 100.', flags: 64 });
    }

    try {
      const messages = await channel.messages.fetch({ limit: quantidade });
      const recentMessages = messages.filter(msg => (Date.now() - msg.createdTimestamp) < 1209600000); // 14 dias

      if (recentMessages.size > 0) {
        await channel.bulkDelete(recentMessages, true);
        await interaction.reply({ content: `✅ ${recentMessages.size} mensagens recentes foram apagadas.`, flags: 64 });
      }

      const oldMessages = messages.filter(msg => (Date.now() - msg.createdTimestamp) >= 1209600000);
      if (oldMessages.size > 0) {
        for (const msg of oldMessages.values()) {
          await msg.delete();
        }
        await interaction.followUp({ content: `⚠️ ${oldMessages.size} mensagens antigas foram apagadas manualmente.`, flags: 64 });
      }

    } catch (error) {
      await interaction.reply({ content: `Erro ao apagar mensagens: ${error.message}`, flags: 64 });
    }
  },
};
