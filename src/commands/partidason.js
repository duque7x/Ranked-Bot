const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const Match = require("../structures/database/match");
const returnMatchStats = require("../utils/functions/returnMatchStats");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("partidason")
        .setDescription("Manda uma ou varias embed com as partidas online.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const matches = await Match.find({});
        let embeds = [];

        matches.filter(match => match.status === "created" || match.status === "on").forEach(match => embeds.push(returnMatchStats(match)));

        if (embeds.length > 0) {
            await interaction.reply({ content: `# Partidas abertas:`, flags: 64 });

            for (let i = 0; i < embeds.length; i += 10) {
                const chunk = embeds.slice(i, i + 10);
                await interaction.followUp({ embeds: chunk });
            }
        } else {
            await interaction.reply({ content: "# Não há partidas abertas.", flags: 64 });
        }

    }
};