const Match = require("../../structures/database/match");
const sendReply = require("../_functions/sendReply");
const Config = require('../../structures/database/configs');
const { SlashCommandBuilder, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require("discord.js");
const { errorMessages, returnUserRank } = require("../utils");
const formatTeam = require("../_functions/formatTeam");

module.exports = async function enterBet_handler(interaction) {
    const serverConfig = await Config.findOneAndUpdate(
        { "guild.id": interaction.guild.id },  // Find the document by guild ID
        { $setOnInsert: { guild: { name: interaction.guild.name, id: interaction.guild.id } } },  // Only set this if the document doesn't exist
        { new: true, upsert: true }  // Return the updated document, and create one if it doesn't exist
    );
    const { user } = interaction;
    const userProfile = (await returnUserRank(user, interaction)).foundUser;

    await interaction.deferUpdate({ flags: 64 });
    let [action, matchType, matchId, amount] = interaction.customId.split("-");
    const userId = interaction.user.id;
    const maximumSize = matchType.includes("x")
        ? 2 * Number(matchType.split("x")[0])
        : 2 * Number(matchType.split("v")[0]);

    // Find matches where the user is a player
    let [activeMatchs, match] = await Promise.all([await Match.find({ "players": { $elemMatch: { id: userId } } }), await Match.findOne({ _id: matchId })]);
    // Filter ongoing matches (not "off" or "shutted")
    let ongoingMatchs = activeMatchs.filter(b => b.status !== "off" && b.status !== "shutted").sort((a, b) => b.createdAt - a.createdAt);

    // Prevent user from joining another match if already in one
    if (ongoingMatchs.length > 0) {
        let msg = ongoingMatchs.map(match => match._id);

        return sendReply(interaction, `# Você já está em outra aposta! <#${ongoingMatchs[0].matchChannel?.id || ""}>\n-# Id da aposta(s): ${msg.join(", ")}\n-# Chame um ADM se esta tendo problemas.`);
    }

    if (!match) return sendReply(interaction, errorMessages.match_off);
    if (serverConfig.state.matchs.status === "off") return interaction.followUp({ embeds: errorMessages.matchs_off, flags: 64 });
    if (userProfile.blacklisted == true) return sendReply(interaction, errorMessages.blacklist);
    if (match.players.some(i => i.id == userId)) return sendReply(interaction, `# Você já está na aposta!\n-# Id da aposta(s): ${match._id}\n-# Chame um ADM se esta tendo problemas.`);
    const [teamSize] = matchType.includes("x") ? matchType.split("x").map(Number) : matchType.split("v").map(Number);
    const { players } = match;

    match.players.push({ id: userId, joinedAt: Date.now(), name: interaction.user.username });
    await match.save();


    const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
        .setFields([
            { name: "Time 1", value: formatTeam(players.slice(0, teamSize), teamSize), inline: true },
            { name: "Time 2", value: formatTeam(players.slice(teamSize), teamSize), inline: true }
        ])
    await interaction.message.edit({ embeds: [updatedEmbed] });

    if (match.players.length == maximumSize) {
        return require("../_functions/createBetChannel")(interaction, match);
    }
    return;
}

