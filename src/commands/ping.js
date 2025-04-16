const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const myColours = require("../structures/colours");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Manda o ping do bot"),

    /**
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const now = Date.now();
        await interaction.reply({ content: 'Pingando...', withResponse: true, flags: 64 });
        const ping = Date.now() - now;
        await interaction.editReply(`Pong! Latentia é ${ping}ms.`);
    }
};
