const Match = require("../../structures/database/match");
const sendReply = require("../_functions/sendReply");
const { SlashCommandBuilder, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require("discord.js");


module.exports = async function setWinner_handler(interaction) {
    const { member, customId } = interaction;
    const [action, matchId] = customId.split("-");
    let match = await Match.findById(matchId);

    if (!match) return sendReply(interaction, "# Esta partida não existe!");
    if (match.winner) return sendReply(interaction, errorMessages.match_won + `\nId: **${matchId}**`);

    const setWinnerEmbed = new EmbedBuilder()
        .setColor(Colors.White)
        .setDescription(`# Adicionar o vencedor da partida!\n-# Caso o vencedor foi mal selecionado, por favor chame um dos nossos ADMs!`);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`btn_set_winner-${match._id}-teamA-teamB`).setLabel("Time 1 vencedor").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`btn_set_winner-${match._id}-teamB-teamA`).setLabel("Time 2 vencedor").setStyle(ButtonStyle.Secondary)
    );

    interaction.reply({ embeds: [setWinnerEmbed], components: [row] })
}