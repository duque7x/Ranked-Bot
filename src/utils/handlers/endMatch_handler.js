const Match = require("../../structures/database/match");
const endmatchFunction = require("../functions/endMatchFunction");
const sendReply = require("../functions/sendReply");
const { SlashCommandBuilder, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require("discord.js");
const { errorMessages} = require("../utils");

module.exports = async function endmatch_handler(interaction) {
    const { member, customId } = interaction;

    const [action, matchId] = customId.split("-");
    let match = await Match.findById(matchId);

    if (!match || match.status == "off") return sendReply(interaction, errorMessages.match_off);
    if (match.winnerTeam.length == 0) return sendReply(interaction, errorMessages.bet_no_winner);

    return endmatchFunction(match, interaction);
}