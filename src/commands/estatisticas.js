const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Colors } = require("discord.js");
const Bet = require("../structures/database/bet");
const createActivityChart = require("../utils/_functions/createActivityChart");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("estatisticas")
        .setDescription("Embed com as estastiticas")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const imageUrl = await createActivityChart();

        const embed = new EmbedBuilder()
            .setTitle("Estatisticas do server")
            .setImage(imageUrl)
            .setTimestamp()
            .setColor(Colors.DarkButNotBlack);  

        interaction.reply({ embeds: [embed] });
    }
};
