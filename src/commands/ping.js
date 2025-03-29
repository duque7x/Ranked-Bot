const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const myColours = require("../structures/colours");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Manda o ping do bot")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pingando...', fetchReply: true });
        const ping = sent.createdTimestamp - interaction.createdTimestamp;
        await interaction.editReply(`Pong! Latentia é ${ping}ms.`);

    }
};
