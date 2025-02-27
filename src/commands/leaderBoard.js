const { SlashCommandBuilder, EmbedBuilder, Colors, PermissionFlagsBits, ChatInputCommandInteraction, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const User = require("../structures/database/User");
const myColours = require("../structures/colours");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Manda embed com 2 opcoes: rank, perfil usuario."),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @returns 
     */
    async execute(interaction) {
        if (interaction.member.id !== "877598927149490186") {
            return interaction.reply({ content: "# Você não tem permissão para usar este comando!", flags: 64 });
        }

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
