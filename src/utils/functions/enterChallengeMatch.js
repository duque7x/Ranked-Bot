const { EmbedBuilder, StringSelectMenuInteraction, PermissionFlagsBits } = require("discord.js");
const Config = require("../../structures/database/configs");
const Match = require("../../structures/database/match");
const User = require("../../structures/database/User");
const formatTeamChallenged = require("./formatTeamChallenged");
/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @param {*} match 
 * @returns 
 */
module.exports = async (interaction, match) => {
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
    const { customId, guild, user } = interaction;
    const [_, _2, matchId, teamChosen] = interaction.values[0].split("-");
    const userId = user.id;
    const [serverConfig, userProfile, activeMatches] = await Promise.all([
        Config.findOneAndUpdate(
            { "guild.id": interaction.guild.id },
            { $setOnInsert: { guild: { name: interaction.guild.name, id: interaction.guild.id } } },
            { new: true, upsert: true }
        ),
        User.findOrCreate(userId),
        Match.find({
            "players": { $elemMatch: { id: userId } },
            status: { $nin: ["off", "shutted"] }
        }).sort({ createdAt: -1 })
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
    const { type } = match;
    const [teamSize] = type.split(/[xv]/).map(Number);

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
                    .setTimestamp()
                    .setFooter({ text: "Para sair abre um ticket!" }),
            ],
            flags: 64,
        });
    }
    if (match.kickedOut.some(i => i.id === userId)) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Você foi expulso desta partida")
                    .setDescription(`-# <@${match.creatorId}> expulsou você!`)
                    .setTimestamp()
                    .setColor(0xff0000)
            ],
            flags: 64
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
    let ongoingMatches = activeMatches.filter(b => b.status !== "off" && b.status !== "shutted").sort((a, b) => b.createdAt - a.createdAt);
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
    if (match[teamChosen].length == teamSize) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Equipa cheia")
                    .setDescription("-# Esta equipa está cheia, tente novamente ou entre na outra equipa!")
                    .setColor(0xff0000)
                    .setTimestamp()
            ],
            flags: 64
        });
    }
    const voiceChannelId = interaction.member.voice?.channelId;

    console.log(`${interaction.member.displayName} escolheu o time: ${teamChosen} = `, { teamChosen: match[teamChosen] });
    match[teamChosen].push({ id: userId, joinedAt: Date.now(), name: interaction.user.username });
    match.players.push({ id: userId, joinedAt: Date.now(), name: interaction.user.username });
    userProfile.originalChannels.push({ channelId: voiceChannelId, matchId: match._id });

    await interaction.update({
        embeds: [
            EmbedBuilder.from(interaction.message.embeds[0])
                .setFields([
                    { name: "Time 1", value: formatTeamChallenged(match.teamA, teamSize), inline: true },
                    { name: "Time 2", value: formatTeamChallenged(match.teamB, teamSize), inline: true }
                ])
        ]
    });

    await Promise.all([match.save(), userProfile.save()]);
}