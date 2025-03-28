const Match = require("../../structures/database/match");
const formatTeam = require("../_functions/formatTeam");
const returnErrorToMember = require("../_functions/returnErrorToMember");
const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits, Colors } = require("discord.js");
const { sendReply, errorMessages } = require("../utils");

module.exports = async function shutMatch_handler(interaction, matchId) {
    let match = await Match.findOne({ "_id": matchId });
    const userId = interaction.user.id;

    if (!match) return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setTitle("Partida offline")
                .setDescription("Esta partida não se encontra na base de dados")
                .setColor(0xff00000)
                .setTimestamp()
        ]
    });
    if (match.creatorId !== userId) return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setTitle("Você não pode encerrar esta partida.")
                .setDescription(`<@${userId}> não és o usuario que iniciou esta fila.`)
                .setTimestamp()
                .setColor(0xff0000)
        ]
    });

    match.status = "shutted";
    match.save();

    const updatedEmbed = new EmbedBuilder()
        .setTitle("Partida encerrada com successo!")
        .setDescription(`Partida encerrada por <@${userId}>`)
        .setTimestamp()
        .setColor(Colors.DarkButNotBlack);

    await interaction.message.edit({ embeds: [updatedEmbed], components: [] });

    setTimeout(async () => {
        await match.deleteOne();
    }, 2000);

    return;
};

