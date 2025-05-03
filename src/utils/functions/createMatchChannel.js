const Match = require("../../structures/database/match");
const { PermissionFlagsBits, EmbedBuilder, ChannelType, Colors, ActionRowBuilder, ChatInputCommandInteraction } = require("discord.js");
const moveToChannel = require("./moveToChannel");
const returnMatchSelectMenu = require("./returnMatchSelectMenu");
const User = require("../../structures/database/User");

/**
 * @param {import("discord.js").Interaction} interaction
 * @param {Match} match
 */
module.exports = async (interaction, match) => {
  try {
    const { guild } = interaction;
    const totalMatches = (await Match.countDocuments()).toString().padStart(3, "0");
    const { matchType } = match;
    const { teamA, teamB } = randomizeTeams(match.players);

    const createVoiceChannel = (name, allow = [], deny = []) =>
      guild.channels.create({
        name: `${name}・${totalMatches}`,
        type: ChannelType.GuildVoice,
        permissionOverwrites: [
          { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect] },
          ...allow.map(p => ({
            id: p.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
            deny: [PermissionFlagsBits.UseSoundboard],
          })),
          ...deny.map(p => ({
            id: p.id,
            allow: [PermissionFlagsBits.ViewChannel],
            deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.UseSoundboard],
          })),
        ],
      });

    const matchChannel = await guild.channels.create({
      name: `Fila・${totalMatches}`,
      type: ChannelType.GuildText,
      topic: match._id.toString(),
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        },
        ...match.players.map(p => ({
          id: p.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        })),
      ],
    });

    const [globalVoiceChannel, teamAVoiceChannel, teamBVoiceChannel] = await Promise.all([
      createVoiceChannel(`${totalMatches} - Global`, match.players),
      createVoiceChannel(`${totalMatches} - Equipa 1`, teamA, teamB),
      createVoiceChannel(`${totalMatches} - Equipa 2`, teamB, teamA),
    ]);

    for (const player of match.players) {
      const member = guild.members.cache.get(player.id);
      const userProfile = await User.findOrCreate(player.id);

      if (member?.voice.channel) {
        const isTeamA = teamA.some(p => p.id === player.id);
        userProfile.originalChannels.push({
          channelId: interaction.member.voice.channelId,
          matchId: match._id
        });

        await moveToChannel(member, isTeamA ? teamAVoiceChannel : teamBVoiceChannel);
        await Promise.all([userProfile.save()]);
      }
    }

    const embedTeamA = formatTeam(teamA);
    const embedTeamB = formatTeam(teamB);
    const row = new ActionRowBuilder().addComponents(returnMatchSelectMenu(match));

    await matchChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Grey)
          .setDescription(`# Fila ${matchType} | Normal\nCriem a sala e de seguida definam o criador!`)
          .addFields(
            { name: "Time 1", value: embedTeamA, inline: true },
            { name: "Time 2", value: embedTeamB, inline: true },
          )
          .setTimestamp()
      ],
      components: [row]
    });
    await interaction.editReply({
      embeds: [
        EmbedBuilder.from(interaction.message.embeds[0])
          .setTitle(`Fila ${matchType} iniciada`)
          .setFields([])
          .setDescription(`Fila criada com sucesso, vá para o canal e siga os procedimentos necessários`)
          .setTimestamp(),
      ],
      components: [],
    });

    Object.assign(match, {
      matchChannel: { id: matchChannel.id, name: matchChannel.name },
      teamA,
      teamB,
      leaders: [teamA[0], teamB[0]],
      voiceChannels: [
        { name: teamAVoiceChannel.name, id: teamAVoiceChannel.id },
        { name: globalVoiceChannel.name, id: globalVoiceChannel.id },
        { name: teamBVoiceChannel.name, id: teamBVoiceChannel.id },
      ],
      status: "on",
    });

    await match.save();
    return matchChannel;
  } catch (error) {
    console.error(error);
    if (interaction.message) {
      interaction.message.edit({
        embeds: [
          new EmbedBuilder()
            .setTitle("Ocorreu um erro")
            .setDescription("Ocorreu um erro enquanto criava os canais da Fila.\n-# Chame um dos nossos developers.")
            .setColor(Colors.Red)
            .setTimestamp(),
        ],
        components: [],
      });
    }
  }
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
function randomizeTeams(players) {
  const shuffled = shuffleArray([...players]);
  const half = Math.ceil(shuffled.length / 2);
  return {
    teamA: shuffled.slice(0, half),
    teamB: shuffled.slice(half),
  };
}
function formatTeam(team) {
  return team.map((player, index) =>
    `${process.env.ON_EMOJI} ${index === 0 ? "**Capitão**" : "**Jogador:**"} <@${player.id}>`
  ).join("\n") || `${process.env.OFF_EMOJI} Slot vazio`;
}