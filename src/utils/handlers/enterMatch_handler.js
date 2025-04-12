const Match = require("../../structures/database/match");
const sendReply = require("../functions/sendReply");
const Config = require('../../structures/database/configs');
const { SlashCommandBuilder, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require("discord.js");
const { errorMessages, returnUserRank } = require("../utils");
const formatTeam = require("../functions/formatTeam");
const User = require("../../structures/database/User");

module.exports = async function enterBet_handler(interaction) {
    if (!interaction.member.voice.channel && !interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Canal de voz")
                    .setDescription("Você tem que estar conectado a um canal de voz para entrar uma fila!")
                    .setColor(0xff0000)
                    .setTimestamp()
            ],
            flags: 64
        });
    }

    const serverConfig = await Config.findOneAndUpdate(
        { "guild.id": interaction.guild.id },
        { $setOnInsert: { guild: { name: interaction.guild.name, id: interaction.guild.id } } },
        { new: true, upsert: true }
    );

    const { user } = interaction;
    const userProfile = await User.findOrCreate(user.id);

    // Check if match exists and save channel info
    const [action, matchType, matchId, amount] = interaction.customId.split("-");
    const userId = interaction.user.id;
    const maximumSize = matchType.includes("x") ? 2 * Number(matchType.split("x")[0]) : 2 * Number(matchType.split("v")[0]);

    let [activeMatchs, match] = await Promise.all([
        await Match.find({ "players": { $elemMatch: { id: userId } } }),
        await Match.findOne({ _id: matchId })
    ]);

    if (!match) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Partida offline")
                    .setDescription("Esta partida não se encontra na base de dados")
                    .setColor(0xff0000)
                    .setTimestamp(),
            ],
            flags: 64,
        });
    }
    if (serverConfig.state.matches.status === "off") {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Partidas offline")
                    .setDescription("As filas estão fechadas de momento!")
                    .setColor(0xff0000)
                    .setTimestamp(),
            ],
            flags: 64,
        });
    }
    if (userProfile.blacklisted === true) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Você está na blacklist")
                    .setDescription("Infelizmente o seu id se encontra na blacklist!")
                    .setColor(0xff0000)
                    .setTimestamp(),
            ],
            flags: 64,
        });
    }
    if (match.players.some(i => i.id === userId)) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Você já está nessa partida")
                    .setDescription("-# Se não aparece que você esta na partida, não se preocupe!")
                    .setTimestamp()
                    .setColor(0xff0000)
            ],
            flags: 64
        });
    }

    // Filter ongoing matches
    let ongoingMatchs = activeMatchs.filter(b => b.status !== "off" && b.status !== "shutted").sort((a, b) => b.createdAt - a.createdAt);

    // Prevent joining another match if already in one
    if (ongoingMatchs.length > 0) {
        let msg = ongoingMatchs.map(m => m._id);
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Você já está em outra partida")
                    .setDescription(`Canal: <#${ongoingMatchs[0].matchChannel.id}>\n-# Chame um ADM se esta tendo problemas.`)
                    .setTimestamp()
                    .setColor(0xff0000)
            ],
            flags: 64
        });
    }

    // Add player to match and save
    const [teamSize] = matchType.includes("x") ? matchType.split("x").map(Number) : matchType.split("v").map(Number);
    match.players.push({ id: userId, joinedAt: Date.now(), name: interaction.user.username });
    userProfile.originalChannels.push({ channelId: interaction.member.voice.channelId, matchId: match._id });
    await match.save();
    await userProfile.save();

    const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
        .setFields([
            { name: "Time 1", value: formatTeam(match.players.slice(0, teamSize), teamSize), inline: true },
            { name: "Time 2", value: formatTeam(match.players.slice(teamSize), teamSize), inline: true }
        ]);

    await interaction.message.edit({ embeds: [updatedEmbed] });

    if (match.players.length === maximumSize) {
        return require("../functions/createMatchChannel")(interaction, match);
    }
    return;
}
