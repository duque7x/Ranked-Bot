const Match = require("../../structures/database/match");
const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits, StringSelectMenuInteraction } = require("discord.js");
const formatTeamChallenged = require("../functions/formatTeamChallenged");

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @param {*} match 
 * @returns 
 */
module.exports = async (interaction) => {
    interaction.deferUpdate()
    const [_1, _id, messageId] = interaction.customId.split("-");
    const [_, userId] = interaction.values[0].split("-");

    const match = await Match.findOne({ _id });
    const { matchType } = match;
    const [teamSize] = matchType.includes("x") ? matchType.split("x").map(Number) : matchType.split("v").map(Number);
    const message = interaction.channel.messages.cache.get(messageId);

    if (!match.players.some(i => i.id === userId)) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Este usuário não está nessa partida")
                    .setDescription("-# Se aparece que ele esta na partida, não se preocupe!")
                    .setTimestamp()
                    .setColor(0xff0000)
            ],
            flags: 64
        });
    }

    const teamAIncludes = match.teamA.some(player => player.id == userId);
    const teamBIncludes = match.teamB.some(player => player.id == userId);

    match.players = match.players.filter(player => player.id !== userId);
    match.kickedOut.push({ id: userId});

    if (teamAIncludes) match.teamA = match.teamA.filter(player => player.id !== userId);
    if (teamBIncludes) match.teamB = match.teamB.filter(player => player.id !== userId);

    const updatedEmbed = EmbedBuilder.from(message.embeds[0])
        .setFields([
            { name: "Time 1", value: formatTeamChallenged(match.teamA, teamSize), inline: true },
            { name: "Time 2", value: formatTeamChallenged(match.teamB, teamSize), inline: true }
        ]);

    await message.edit({ embeds: [updatedEmbed] });
    interaction.reply({
        content: "Jogador expulso!",
        flags: 64
    });
    await match.save();
}