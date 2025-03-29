const Match = require("../../structures/database/match");
const formatTeam = require("../functions/formatTeam");
const returnErrorToMember = require("../functions/returnErrorToMember");
const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require("discord.js");
const { sendReply, errorMessages } = require("../utils");

module.exports = async function outMatch_handler(interaction, matchId) {
    let match = await Match.findOne({ "_id": matchId });
    const userId = interaction.user.id;

    // Check for errors and add to errorTypes array
    if (!match || match.status === "off" || match == null) return sendReply(interaction, errorMessages.bet_off);
    if (!match.players?.some(i => i.id === userId)) return sendReply(interaction, errorMessages.bet_not_in);
    
    // Remove player from the match
    match.players = match.players.filter(player => player.id !== userId);
    await match.save();

    const { matchType } = match;
    const [teamSize] = matchType.includes("x") ? matchType.split("x").map(Number) : matchType.split("v").map(Number);

    await interaction.deferUpdate(); // Acknowledge interaction first

    const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
        .setFields([
            { name: "Time 1", value: formatTeam(match.players.slice(0, teamSize), teamSize), inline: true },
            { name: "Time 2", value: formatTeam(match.players.slice(teamSize), teamSize), inline: true }
        ]);
    
    await interaction.message.edit({ embeds: [updatedEmbed] });
};

