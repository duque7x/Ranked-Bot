const Bet = require("../../structures/database/bet");
const endBetFunction = require("../_functions/endBetFunction");
const sendReply = require("../_functions/sendReply");
const { SlashCommandBuilder, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = async function endBet_handler(interaction) {
    if (!member?.permissions.has(PermissionFlagsBits.Administrator) && !member.roles.cache.has("1336838133030977666")) return sendReply(interaction, "# Você precisa falar com um ADM ou MEDIADOR para fechar a aposta!");

    const [action, betId] = customId.split("-");
    let bet = await Bet.findById(betId);

    if (!bet.winner) return sendReply(interaction, errorMessages.bet_no_winner);
    if (!bet) return sendReply(interaction, "# Nenhuma aposta encontrada com esse ID.");
    if (bet.status == "off") return sendReply(interaction, errorMessages.bet_off);

    return endBetFunction(bet, interaction);
}