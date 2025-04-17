const Match = require("../../structures/database/match");
const { PermissionFlagsBits, EmbedBuilder, ChannelType, Colors, ActionRowBuilder, ChatInputCommandInteraction } = require("discord.js");
const moveToChannel = require("./moveToChannel");
const User = require("../../structures/database/User");
const returnMatchSelectMenu = require("./returnMatchSelectMenu");

/**
 *
 * @param {ChatInputCommandInteraction} interaction
 * @param {Match} match
 * @returns
 */
module.exports = async (interaction, match) => {
  try {
    const { guild } = interaction;
    const totalMatches = await Match.countDocuments();
    const formattedTotalMatches = String(totalMatches).padStart(3, "0");
    const { matchType } = match;
    const [teamSize] = matchType.includes("x")
      ? matchType.split("x").map(Number)
      : matchType.split("v").map(Number);
    const { teamA, teamB } = randomizeTeams(match.players);

    const createVoiceChannel = async (name, allow = [], deny = []) =>
      guild.channels.create({
        name: `${name}・${formattedTotalMatches}`,
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
    const matchChannel = await guild.channels.create({
      name: `partida・${formattedTotalMatches}`,
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
    const embedForChannel = new EmbedBuilder()
      .setColor(Colors.Grey)
      .setDescription(
        `# Partida ${matchType} | Normal\nCriem a sala e de seguida definam o criador!`
      )
      .addFields([
        { name: "Time 1", value: embedTeamA, inline: true },
        { name: "Time 2", value: embedTeamB, inline: true },
      ])
      .setTimestamp();
    matchChannel.send({
      embeds: [embedForChannel],
      components: [row],
    });
    const [globalVoiceChannel, teamAVoiceChannel, teamBVoiceChannel] = await Promise.all([
      createVoiceChannel("Global", match.players),
      createVoiceChannel("Equipa 1", teamA, teamB),
      createVoiceChannel("Equipa 2", teamB, teamA),
    ]);

    for (let player of match.players) {
      const member = guild.members.cache.get(player.id);
      const userProfile = await User.findOrCreate(member.id);
      if (!member || !member.voice.channel) continue;

      userProfile.originalChannels.push({
        channelId: member.voice.channelId,
        matchId: match._id,
      });
      userProfile.save();
    }
    for (let playerMatch of teamA) {
      const member = guild.members.cache.get(playerMatch.id);
      if (member.voice.channel) await moveToChannel(member, teamAVoiceChannel);
    }
    for (let playerMatch of teamB) {
      const member = guild.members.cache.get(playerMatch.id);
      if (member.voice.channel) await moveToChannel(member, teamBVoiceChannel);
    }

    const embedTeamA = formatTeam(teamA, teamA.length);
    const embedTeamB = formatTeam(teamB, teamB.length);



    // Buttons
    const row = new ActionRowBuilder().addComponents(returnMatchSelectMenu(match));



    interaction.message.edit({
      embeds: [
        new EmbedBuilder()
          .setTitle(`Partida ${matchType} criada com sucesso!`)
          .setColor(0xFFCF69)
          .setDescription(
            `Esta partida foi criada neste [canal](https://discord.com/channels/1336809872884371587/${matchChannel.id})\n-# Qualquer tipo de problema chame um ADM!`
          )
          .setTimestamp(),
      ],
      components: [],
    });

    match.matchChannel = { id: matchChannel.id, name: matchChannel.name };
    match.teamA = teamA;
    match.teamB = teamB;
    match.leaders = [teamA[0], teamB[0]];
    match.voiceChannels = [
      { name: teamAVoiceChannel.name, id: teamAVoiceChannel.id },
      { name: globalVoiceChannel.name, id: globalVoiceChannel.id },
      { name: teamBVoiceChannel.name, id: teamBVoiceChannel.id },
    ];
    match.status = "on";

    match.save();
    return matchChannel;
  } catch (error) {
    console.error(error);

    interaction.message.edit({
      embeds: [
        new EmbedBuilder()
          .setTitle("Occourreu um erro")
          .setDescription("Occorreu um erro enquanto criava os canais da partida.\n-# Chame um dos nossos developers.")
          .setColor(0xff0000)
          .setTimestamp()
      ]
    });
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
  let shuffledPlayers = shuffleArray([...players]);
  let half = Math.ceil(shuffledPlayers.length / 2);
  return {
    teamA: shuffledPlayers.slice(0, half),
    teamB: shuffledPlayers.slice(half),
  };
}
function formatTeam(team, size) {
  return Array.from({ length: size }, (_, i) =>
    team[i]
      ? `${i == 0 || i == size ? "**Capitão**" : "**Jogador:** "} <@${team[i].id
      }>`
      : "Slot vazio"
  ).join("\n");
}