const Match = require("../../structures/database/match");
const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require("discord.js");
const formatTeamChallenged = require("./formatTeamChallenged");

module.exports = async function outMatch_handler(interaction, match) {
    const userId = interaction.user.id;
    const { matchType } = match;
    const [teamSize] = matchType.includes("x") ? matchType.split("x").map(Number) : matchType.split("v").map(Number);

    if (!match.players.some(i => i.id === userId)) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Você não está nessa partida")
                    .setDescription("-# Se aparece que você esta na partida, não se preocupe!")
                    .setTimestamp()
                    .setColor(0xff0000)
            ],
            flags: 64
        });
    }
    if (match.creatorId === userId) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Você não pode sair desta partida")
                    .setDescription("-# O criador da fila não pode sair da fila!")
                    .setTimestamp()
                    .setColor(0xff0000)
            ],
            flags: 64
        });
    }
    await interaction.deferUpdate();
    const teamAIncludes = match.teamA.some(player => player.id == userId);
    const teamBIncludes = match.teamB.some(player => player.id == userId);

    match.players = match.players.filter(player => player.id !== userId);

    if (teamAIncludes) match.teamA = match.teamA.filter(player => player.id !== userId);
    if (teamBIncludes) match.teamB = match.teamB.filter(player => player.id !== userId);

    const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
        .setFields([
            { name: "Time 1", value: formatTeamChallenged(match.teamA, teamSize), inline: true },
            { name: "Time 2", value: formatTeamChallenged(match.teamB, teamSize), inline: true }
        ]);
    console.log({ team: teamAIncludes ?? teamB, teamA: match.teamA, teamB: match.teamB });
    
    await interaction.message.edit({ embeds: [updatedEmbed] });
    await match.save();
};

