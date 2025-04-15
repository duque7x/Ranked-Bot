const Match = require("../../structures/database/match");
const Config = require('../../structures/database/configs');
const { EmbedBuilder, PermissionFlagsBits, Colors } = require("discord.js");
const formatTeam = require("../functions/formatTeam");
const User = require("../../structures/database/User");
const updateRankUsersRank = require("../functions/updateRankUsersRank");

module.exports = async function enterBet_handler(interaction) {
    await interaction.deferUpdate();

    if (!interaction.member.voice.channel && !interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
        return await interaction.followUp({
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
    const [teamSize] = matchType.includes("x") ? matchType.split("x").map(Number) : matchType.split("v").map(Number);
    const maximumSize = teamSize * 2;
    

    if (!match) {
        return interaction.followUp({
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
        return interaction.followUp({
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
        return interaction.followUp({
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
        return interaction.followUp({
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
    let ongoingMatches = activeMatches.filter(b => (b.status !== "off" && b.status !== "shutted") && b._id !== match._id).sort((a, b) => b.createdAt - a.createdAt);

    // Prevent joining another match if already in one
    if (ongoingMatches.length > 0) {
        return interaction.followUp({
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

    match.players.push({ id: userId, joinedAt: Date.now(), name: interaction.user.username });
    userProfile.originalChannels.push({ channelId: interaction.member.voice.channelId, matchId: match._id });


    const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
        .setFields([
            { name: "Time 1", value: formatTeam(match.players.slice(0, teamSize), teamSize), inline: true },
            { name: "Time 2", value: formatTeam(match.players.slice(teamSize), teamSize), inline: true }
        ]);

    await interaction.message.edit({ embeds: [updatedEmbed] });

    if (match.players.length === maximumSize) {
        await interaction.message.edit({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Fila ${matchType} | Normal`)
                    .setDescription(`Fila **iniciada**, aguarde a criação dois canais da fila.`)
                    .setTimestamp()
                    .setColor(Colors.DarkerGrey)
            ],
            components: []
        });

        return require("../functions/createMatchChannel")(interaction, match);
    }

    await Promise.allSettled([match.save(), userProfile.save()]);
    await updateRankUsersRank(await interaction.guild.members.fetch());
    return;
}
