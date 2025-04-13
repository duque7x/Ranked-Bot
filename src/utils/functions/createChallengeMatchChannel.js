const Match = require("../../structures/database/match");
const myColours = require("../../structures/colours");
const {
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType,
  Colors,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  lazy,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");
const moveToChannel = require("./moveToChannel");
const User = require("../../structures/database/User");
const formatTeamChallenged = require("./formatTeamChallenged");

/**
 *
 * @param {ChatInputCommandInteraction} interaction
 * @param {Match} match
 * @returns
 */
module.exports = async (interaction, match = new Match()) => {
  await interaction.guild.members.fetch();

  const { guild } = interaction;
  const totalMatches = await Match.countDocuments();
  const formattedTotalMatches = String(totalMatches).padStart(3, "0");
  const { matchType, teamA, teamB } = match;

  const teamAVoiceChannel = await guild.channels.create({
    name: `⭐ Equipa 1・${formattedTotalMatches}`,
    type: ChannelType.GuildVoice,
    parent: "1360710246930055208",
    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
      },
      ...teamA.map((p) => ({
        id: p.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
        deny: [PermissionFlagsBits.UseSoundboard],
      })),
      ...teamB.map((p) => ({
        id: p.id,
        allow: [PermissionFlagsBits.ViewChannel],
        deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.UseSoundboard],
      })),
    ],
  });
  const globalVoiceChannel = await guild.channels.create({
    name: `⭐ Global・${formattedTotalMatches}`,
    type: ChannelType.GuildVoice,
    parent: "1360710246930055208",
    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
        deny: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
        ],
      },
      ...match.players.map((p) => ({
        id: p.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
        deny: [PermissionFlagsBits.UseSoundboard],
      })),
    ],
  });
  const teamBVoiceChannel = await guild.channels.create({
    name: `⭐ Equipa 2・${formattedTotalMatches}`,
    type: ChannelType.GuildVoice,
    parent: "1360710246930055208",
    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
        deny: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
        ],
      },
      ...teamB.map((p) => ({
        id: p.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
        deny: [PermissionFlagsBits.UseSoundboard],
      })),
      ...teamA.map((p) => ({
        id: p.id,
        allow: [PermissionFlagsBits.ViewChannel],
        deny: [
          PermissionFlagsBits.Connect,
          ,
          PermissionFlagsBits.UseSoundboard,
        ],
      })),
    ],
  });
  for (let playerMatch of teamA) {
    const member = interaction.guild.members.cache.get(playerMatch.id);
    const userProfile = await User.findOrCreate(member.id);

    await userProfile.originalChannels.push({
      channelId: member.voice.channelId,
      matchId: match._id,
    });

    if (member.voice.channel) await moveToChannel(member, teamBVoiceChannel);
    await userProfile.save();
  }
  for (let playerMatch of teamB) {
    const member = interaction.guild.members.cache.get(playerMatch.id);
    const userProfile = await User.findOrCreate(member.id);

    await userProfile.originalChannels.push({
      channelId: member.voice.channelId,
      matchId: match._id,
    });

    if (member.voice.channel) await moveToChannel(member, teamBVoiceChannel);
    await userProfile.save();
  }

  const matchChannel = await guild.channels.create({
    name: `⭐・partida・${formattedTotalMatches}`,
    type: ChannelType.GuildText,
    topic: match._id.toString(),
    parent: "1360710246930055208",
    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
        deny: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
        ],
      },
      ...match.players.map((p) => ({
        id: p.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
        ],
      })),
    ],
  });

  const embedTeamA = formatTeamChallenged(teamA, teamA.length),
    embedTeamB = formatTeamChallenged(teamB, teamB.length);

  // Embed for the match channel
  const embedForChannel = new EmbedBuilder()
    .setColor(0x80D1FF)
    .setDescription(
      `# Partida ${matchType} | Desafio\nCriem a sala e de seguida definam o criador!`
    )
    .addFields([
      { name: "Time 1", value: embedTeamA, inline: true },
      { name: "Time 2", value: embedTeamB, inline: true },
    ])
    .setTimestamp();

  // Buttons
  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`select_menu-${match._id}`)
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Definir Criador")
          .setValue(`creator-${match._id}`)
          .setEmoji("🛠️"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Definir Mvp")
          .setValue(`mvp-${match._id}`)
          .setEmoji("⭐"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Definir Vencedor")
          .setValue(`winner-${match._id}`)
          .setEmoji("🥇"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Encerrar partida")
          .setValue(`end_match-${match._id}`)
      )
  );

  await matchChannel.send({
    embeds: [embedForChannel],
    components: [row],
  });

  await interaction.message.edit({
    embeds: [
      new EmbedBuilder()
        .setTitle(`Partida ${matchType} iniciada com sucesso!`)
        .setColor(Colors.LightGrey)
        .setDescription(
          `O canal da partida é <#${matchChannel.id}>`
        )
        .setTimestamp(),
    ],
    components: [],
  });

  match.matchChannel = { id: matchChannel.id, name: matchChannel.name };
  match.leaders = [teamA[0], teamB[0]];
  match.voiceChannels = [
    { name: teamAVoiceChannel.name, id: teamAVoiceChannel.id },
    { name: globalVoiceChannel.name, id: globalVoiceChannel.id },
    { name: teamBVoiceChannel.name, id: teamBVoiceChannel.id },
  ];

  match.status = "on";

  await match.save();
  return matchChannel;
};
