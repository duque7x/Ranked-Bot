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

  if (match.creatorId !== userId) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Você não pode iniciar esta fila")
          .setDescription(`<@${userId}> você não tem permissões para iniciar esta fila`)
          .setTimestamp()
          .setColor(0xff0000)
      ],
      flags: 64
    });
  }
  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle(`Fila ${matchType} | Desafio`)
        .setDescription(`Fila **iniciada**, aguarde a criação dos canais da fila.`)
        .setTimestamp()
        .setColor(Colors.White)
    ],
    components: []
  });
  const matchText = await guild.channels.create({
    name: `⭐・partida・${formattedNumber}`,
    type: ChannelType.GuildText,
    topic: match._id.toString(),
    //parent: "1360710246930055208",
    permissionOverwrites: [
      { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      ...players.map(p => ({
        id: p.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      })),
    ],
  });
  const createVoiceChannel = async (name, allow = [], deny = []) =>
    guild.channels.create({
      name: `⭐ ${name}・${formattedNumber}`,
      type: ChannelType.GuildVoice,
      //parent: "1360710246930055208",
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

  const saveAndMovePlayers = async (team, voiceChannel) => {
    return Promise.all(
      team.map(async (player) => {
        const member = guild.members.cache.get(player.id);
        if (!member?.voice.channel) return;

        const userProfile = await User.findOrCreate(player.id);
        userProfile.originalChannels.push({
          channelId: interaction.member.voice.channelId,
          matchId: match._id,
        });

        await userProfile.save();
        await moveToChannel(member, voiceChannel);
      })
    );
  };

  await saveAndMovePlayers(teamA, teamAVoice);
  await saveAndMovePlayers(teamB, teamBVoice);


  // Send embed with match info
  const embed = new EmbedBuilder()
    .setColor(Colors.DarkGrey)
    .setDescription(`# Partida ${matchType} | Desafio\nCriem a sala e de seguida definam o criador!`)
    .addFields(
      { name: "Time 1", value: formatTeamChallenged(teamA, teamA.length), inline: true },
      { name: "Time 2", value: formatTeamChallenged(teamB, teamB.length), inline: true },
    )
    .setTimestamp();

  const menu = new ActionRowBuilder().addComponents(returnMatchSelectMenu(match));

  await matchText.send({ embeds: [embed], components: [menu] });

  match.matchChannel = { id: matchText.id, name: matchText.name };
  match.leaders = [teamA[0], teamB[0]];
  match.voiceChannels = [
    { name: teamAVoice.name, id: teamAVoice.id },
    { name: globalVoice.name, id: globalVoice.id },
    { name: teamBVoice.name, id: teamBVoice.id },
  ];
  match.status = "on";

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setTitle(`Fila ${matchType} | Desafio`)
        .setDescription(`Fila **criada**, vá para o canal da fila e siga os procedimentos necessários`)
        .setTimestamp()
        .setColor(Colors.White)
    ],
    components: []
  });
  await match.save();

  return matchText;
};
