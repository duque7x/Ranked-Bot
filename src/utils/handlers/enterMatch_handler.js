const Match = require("../../structures/database/match");
const Config = require('../../structures/database/configs');
const { EmbedBuilder, PermissionFlagsBits, Colors, ButtonInteraction } = require("discord.js");
const formatTeam = require("../functions/formatTeam");
const User = require("../../structures/database/User");

/**
 * @param {ButtonInteraction} interaction 
 */
module.exports = async function enterBet_handler(interaction) {
    if (!interaction.member.voice.channel && !interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
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
    const [_, matchType, matchId] = interaction.customId.split("-");

    const [serverConfig, userProfile, activeMatches, match] = await Promise.all([
        Config.findOrCreate(interaction.guildId),
        User.findOrCreate(userId),
        Match.find({ "players.id": userId, status: { $nin: ["off", "shutted"] } }).sort({ createdAt: -1 }),
        Match.findById(matchId)
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

    if (userProfile.blacklisted) {
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

    if (match.players.some(p => p.id === userId)) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Você já está nessa partida")
                    .setDescription("-# Se não aparece que você esta na partida, não se preocupe!")
                    .setColor(0xff0000)
                    .setTimestamp()
            ],
            flags: 64
        });
    }

    const ongoing = activeMatches.find(m => m._id.toString() !== match._id.toString());
    if (ongoing) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Você já está em outra partida")
                    .setDescription(`Canal: <#${ongoing.matchChannel.id}>\n-# Chame um ADM se esta tendo problemas.`)
                    .setColor(0xff0000)
                    .setTimestamp()
            ],
            flags: 64
        });
    }

    match.players.push({
        id: userId,
        joinedAt: Date.now(),
        name: interaction.user.username
    });

    userProfile.originalChannels.push({
        channelId: interaction.member.voice.channelId,
        matchId: match._id
    });

    const teamSize = Number(matchType.replace(/[a-zA-Z]/g, "").at(0));
    const maxSize = teamSize * 2;

    const teamA = match.players.slice(0, teamSize);
    const teamB = match.players.slice(teamSize, maxSize);

    const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0]).setFields([
        { name: "Time 1", value: formatTeam(teamA, teamSize), inline: true },
        { name: "Time 2", value: formatTeam(teamB, teamSize), inline: true }
    ]);

    await interaction.update({ embeds: [updatedEmbed] });

    if (match.players.length === maxSize) {
        const startEmbed = new EmbedBuilder()
            .setTitle(`Fila ${matchType} | Normal`)
            .setDescription("Fila **iniciada**, aguarde a criação dos canais da fila.")
            .setColor(Colors.DarkerGrey)
            .setTimestamp();

        if (interaction.replied || interaction.deferred) {
            interaction.message.edit({ embeds: [startEmbed], components: [] }).catch(() => {});
        } else {
            await interaction.update({ embeds: [startEmbed], components: [] });
        }

        return require("../functions/createMatchChannel")(interaction, match);
    }

    await match.save();
    await userProfile.save();
};
