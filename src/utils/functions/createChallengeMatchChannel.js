const Match = require("../../structures/database/match");
const User = require("../../structures/database/User");
const moveToChannel = require("./moveToChannel");
const formatTeamChallenged = require("./formatTeamChallenged");
const { PermissionFlagsBits, EmbedBuilder, ChannelType, Colors, ActionRowBuilder, ChatInputCommandInteraction, } = require("discord.js");
const returnMatchSelectMenu = require("./returnMatchSelectMenu");

/**
 * @param {ChatInputCommandInteraction} interaction
 * @param {Match} match
 */
module.exports = async (interaction, match = new Match()) => {
  const { guild } = interaction;
  const totalMatches = await Match.countDocuments();
  const formattedNumber = String(totalMatches).padStart(3, "0");
  const { matchType, teamA, teamB } = match;
  const players = [...teamA, ...teamB];
  const userId = interaction.user.id;

  if (match.creatorId !== userId && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Você não pode encerrar esta partida.")
          .setDescription(`<@${userId}> você não tem permissões.`)
          .setTimestamp()
          .setColor(0xff0000)
      ],
      flags: 64
    });
  }
  await interaction.update({
    embeds: [
      new EmbedBuilder()
        .setTitle(`Fila ${matchType} | Desafio`)
        .setDescription(`Fila **iniciada**, aguarde a criação dos canais da fila.`)
        .setTimestamp()
        .setColor(Colors.DarkGold)
    ],
    components: []
  });
  await interaction.guild.members.fetch();

  const createVoiceChannel = async (name, allow = [], deny = []) =>
    guild.channels.create({
      name: `⭐ ${name}・${formattedNumber}`,
      type: ChannelType.GuildVoice,
      parent: "1360710246930055208",
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

  // Create voice channels
  const [teamAVoice, globalVoice, teamBVoice] = await Promise.all([
    createVoiceChannel("Global", players),
    createVoiceChannel("Equipa 1", teamA, teamB),
    createVoiceChannel("Equipa 2", teamB, teamA),
  ]);

  // Move players and save original channels
  await Promise.all(players.map(async (player) => {
    const member = guild.members.cache.get(player.id);
    const userProfile = await User.findOrCreate(member.id);

    userProfile.originalChannels.push({
      channelId: member.voice.channelId,
      matchId: match._id,
    });

    const isTeamA = teamA.some(p => p.id === member.id);
    const targetChannel = isTeamA ? teamAVoice : teamBVoice;

    if (member.voice.channel) {
      await moveToChannel(member, targetChannel);
    }

    await userProfile.save();
  }));

  // Create match text channel
  const matchText = await guild.channels.create({
    name: `⭐・partida・${formattedNumber}`,
    type: ChannelType.GuildText,
    topic: match._id.toString(),
    parent: "1360710246930055208",
    permissionOverwrites: [
      { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      ...players.map(p => ({
        id: p.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      })),
    ],
  });

  // Send embed with match info
  const embed = new EmbedBuilder()
    .setColor(0x80D1FF)
    .setDescription(`# Partida ${matchType} | Desafio\nCriem a sala e de seguida definam o criador!`)
    .addFields(
      { name: "Time 1", value: formatTeamChallenged(teamA, teamA.length), inline: true },
      { name: "Time 2", value: formatTeamChallenged(teamB, teamB.length), inline: true },
    )
    .setTimestamp();

  const menu = new ActionRowBuilder().addComponents(returnMatchSelectMenu(match));

  await matchText.send({ embeds: [embed], components: [menu] });

  await interaction.message.edit({
    embeds: [
      new EmbedBuilder()
        .setTitle(`Partida ${matchType} criada com succeso!`)
        .setColor(0xFFCF69)
        .setDescription(
          `Esta partida foi criada neste [canal](https://discord.com/channels/1336809872884371587/${matchText.id})\n-# Qualquer tipo de problema chame um ADM!`
        )
        .setTimestamp(),
    ],
    components: [],
  });

  match.matchChannel = { id: matchText.id, name: matchText.name };
  match.leaders = [teamA[0], teamB[0]];
  match.voiceChannels = [
    { name: teamAVoice.name, id: teamAVoice.id },
    { name: globalVoice.name, id: globalVoice.id },
    { name: teamBVoice.name, id: teamBVoice.id },
  ];
  match.status = "on";

  await match.save();
  return matchText;
};
