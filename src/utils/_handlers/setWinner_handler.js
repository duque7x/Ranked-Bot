const Bet = require("../../structures/database/bet");
const sendReply = require("../_functions/sendReply");
const { SlashCommandBuilder, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require("discord.js");


module.exports = async function setWinner_handler(interaction) {
    const { member, customId } = interaction;
    const [action, betId] = customId.split("-");
    let bet = await Bet.findById(betId);
    if (!member?.permissions.has(PermissionFlagsBits.Administrator) && !member.roles.cache.has("1336838133030977666")) return sendReply(interaction, "# Você precisa falar com um ADM ou MEDIADOR para definir um vencedor!");
    if (!bet) return sendReply(interaction, "# Esta aposta não existe!");
    if (bet.winner) return sendReply(interaction, errorMessages.bet_won + `\nId: **${betId}**`);

    const setWinnerEmbed = new EmbedBuilder()
        .setColor(Colors.DarkGold)
        .setDescription(`# Adicionar o vencedor da aposta!\n-# Caso o vencedor foi mal selecionado, por favor chame um dos nossos ADMs!`)
        .setFooter({ text: "Nota: Clicar no ganhador errado de propósito resultara em castigo de 2 semanas!" });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`btn_set_winner-${bet._id}-${bet.players[0]}-${bet.players[1]}`).setLabel("Time 1 vencedor").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId(`btn_set_winner-${bet._id}-${bet.players[1]}-${bet.players[0]}`).setLabel("Time 2 vencedor").setStyle(ButtonStyle.Secondary)
    );

    interaction.reply({ embeds: [setWinnerEmbed], components: [row] })
}