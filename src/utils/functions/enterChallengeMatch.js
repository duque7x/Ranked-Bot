const { EmbedBuilder, StringSelectMenuInteraction } = require("discord.js");
const Config = require("../../structures/database/configs");
const Match = require("../../structures/database/match");
const User = require("../../structures/database/User");
const formatTeamChallenged = require("./formatTeamChallenged");
const createChallengeMatchChannel = require("./createChallengeMatchChannel");

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @param {*} match 
 * @returns 
 */
module.exports = async (interaction, match) => {
    const { customId, guild, user } = interaction;
    const [_, _2, matchId, teamChosen] = interaction.values[0].split("-");
    const userId = user.id;
    const serverConfig = await Config.findOneAndUpdate(
        { "guild.id": interaction.guild.id },
        { $setOnInsert: { guild: { name: interaction.guild.name, id: interaction.guild.id } } },
        { new: true, upsert: true }
    );

    const userProfile = await User.findOrCreate(userId);
    const { matchType } = match;

    let [activeMatchs] = await Promise.all([
        await Match.find({ "players": { $elemMatch: { id: userId } } }),
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

    const [teamSize] = matchType.includes("x") ? matchType.split("x").map(Number) : matchType.split("v").map(Number);
    const maximumSize = teamSize * 2;

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
    let ongoingMatchs = activeMatchs.filter(b => b.status !== "off" && b.status !== "shutted").sort((a, b) => b.createdAt - a.createdAt);
    if (ongoingMatchs.length > 0) {
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
    if (match.players.length == maximumSize) {
        await interaction.message.edit({
            embeds: [
              new EmbedBuilder()
                .setTitle(`Partida ${matchType} sendo iniciada...`)
                .setColor(Colors.LightGrey)
                .setTimestamp(),
            ],
            components: [],
          });
        return createChallengeMatchChannel(interaction, match);
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

    match.players.push({ id: userId, joinedAt: Date.now(), name: interaction.user.username });
    match[teamChosen].push({ id: userId, joinedAt: Date.now(), name: interaction.user.username });
    userProfile.originalChannels.push({ channelId: interaction.member.voice.channelId, matchId: match._id });

    console.log(`${interaction.member.displayName} escolheu o time: ${teamChosen} = `, { teamChosen: match[teamChosen] });

    const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
        .setFields([
            { name: "Time 1", value: formatTeamChallenged(match.teamA, teamSize), inline: true },
            { name: "Time 2", value: formatTeamChallenged(match.teamB, teamSize), inline: true }
        ]);

    await interaction.update({ embeds: [updatedEmbed] });
    await match.save();
    await userProfile.save();

    if (match.players.length == maximumSize) {
        return createChallengeMatchChannel(interaction, match);
    }
}