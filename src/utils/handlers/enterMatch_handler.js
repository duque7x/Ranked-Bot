const Match = require("../../structures/database/match");
const Config = require('../../structures/database/configs');
const { EmbedBuilder, PermissionFlagsBits, Colors, ButtonInteraction } = require("discord.js");
const formatTeam = require("../functions/formatTeam");
const User = require("../../structures/database/User");
const updateRankUsersRank = require("../functions/updateRankUsersRank");

/**
 * 
 * @param {ButtonInteraction} interaction 
 * @returns 
 */
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
    const userId = interaction.user.id;
    const [action, matchType, matchId] = interaction.customId.split("-");
    const [serverConfig, userProfile, activeMatches, match] = await Promise.all([
        Config.findOneAndUpdate(
            { "guild.id": interaction.guild.id },
            { $setOnInsert: { guild: { name: interaction.guild.name, id: interaction.guild.id } } },
            { new: true, upsert: true }
        ),
        User.findOrCreate(userId),
        Match.find({
            "players": { $elemMatch: { id: userId } },
            status: { $nin: ["off", "shutted"] }
        }).sort({ createdAt: -1 }),
        Match.findOne({ _id: matchId })
    ]);
    const teamSize = Number(matchType.replace(/[a-zA-Z]/g, "").at(0));
    const maximumSize = teamSize * 2;
    const [teamA, teamB] = [match.players.slice(0, teamSize), match.players.slice(teamSize, maximumSize)];

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
    let ongoingMatches = activeMatches.filter(b => (b.status !== "off" && b.status !== "shutted") && b._id !== match._id).sort((a, b) => b.createdAt - a.createdAt);
    if (ongoingMatches.length > 0) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Você já está em outra partida")
                    .setDescription(`Canal: <#${ongoingMatches[0].matchChannel.id}>\n-# Chame um ADM se esta tendo problemas.`)
                    .setTimestamp()
                    .setColor(0xff0000)
            ],
            flags: 64
        });
    }
    console.log({ teamA, teamB });

    match.players.push({ id: userId, joinedAt: Date.now(), name: interaction.user.username });
    userProfile.originalChannels.push({ channelId: interaction.member.voice.channelId, matchId: match._id });

    const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
        .setFields([
            { name: "Time 1", value: formatTeam(teamA, teamSize), inline: true },
            { name: "Time 2", value: formatTeam(teamB, teamSize), inline: true }
        ]);

    await interaction.update({ embeds: [updatedEmbed] });

    if (match.players.length === maximumSize) {
        if (interaction.replied || interaction.deferred) {
            await interaction.message.edit({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Fila ${matchType} | Normal`)
                        .setDescription(`Fila **iniciada**, aguarde a criação dos canais da fila.`)
                        .setTimestamp()
                        .setColor(Colors.DarkerGrey)
                ],
                components: []
            });
        } else {
            await interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Fila ${matchType} | Normal`)
                        .setDescription(`Fila **iniciada**, aguarde a criação dos canais da fila.`)
                        .setTimestamp()
                        .setColor(Colors.DarkerGrey)
                ],
                components: []
            });
        }
        return require("../functions/createMatchChannel")(interaction, match);
    }
    await User.updateOne(
        { userId },
        { $push: { originalChannels: { channelId: interaction.member.voice.channelId, matchId: match._id } } }
    );
    await Match.updateOne(
        { _id: match._id },
        { $push: { players: { id: userId, joinedAt: Date.now(), name: interaction.user.username } } }
    );
    return;
}