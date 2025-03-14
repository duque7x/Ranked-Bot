const { SlashCommandBuilder, EmbedBuilder, Colors, PermissionFlagsBits, ChatInputCommandInteraction, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const User = require("../structures/database/User");
const myColours = require("../structures/colours");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Manda embed com 2 opcoes: rank, perfil usuario.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @returns 
     */
    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor(Colors.NotQuiteBlack)
            .setDescription("# Tabela rank\n\n**VER RANK**: estatísticas do servidor em geral\n\n**VER PERFIL**: a suas estatísticas em geral")
        const seeRankBtn = new ButtonBuilder()
            .setCustomId("see_rank")
            .setLabel("Ver rank")
            .setStyle(ButtonStyle.Secondary);

        const seeProfileBtn = new ButtonBuilder()
            .setCustomId("see_profile")
            .setLabel("Ver perfil")
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(seeRankBtn, seeProfileBtn);

        await interaction.deferReply({ flags: 64 }); // Torna a resposta invisível
        await interaction.deleteReply(); // Apaga a resposta imediatamente
        interaction.channel.send({ embeds: [embed], components: [row] });

        return;
    }
};
