const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const updateRankUsersRank = require("../utils/functions/updateRankUsersRank");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('atualizarrankings')
        .setDescription('Atualiza os rankings dos usuarios')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    /**
     * @param {import("discord.js").CommandInteraction} interaction
     */
    async execute(interaction) {
        try {
            interaction.reply({ content: "Atualizando...", flags: 64 });

            await updateRankUsersRank(interaction.guild.members);

            await interaction.editReply({ content: "Ranking dos usuarios atualizado.", flags: 64 });
            return;
        } catch (error) {
            await interaction.reply({ content: "Ouve um erro ao atualizar os usuarios.", flags: 64 });
            console.error(error);
        }
    },
};
