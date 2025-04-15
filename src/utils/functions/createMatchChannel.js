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

/**
 *
 * @param {ChatInputCommandInteraction} interaction
 * @param {Match} match
 * @returns
 */
module.exports = async (interaction, match = new Match()) => {
  const { guild } = interaction;
  const totalMatches = await Match.countDocuments();
  const formattedTotalMatches = String(totalMatches).padStart(3, "0");
  const { matchType } = match;
  const [teamSize] = matchType.includes("x")
    ? matchType.split("x").map(Number)
    : matchType.split("v").map(Number);
  const { teamA, teamB } = randomizeTeams(match.players);

  const globalVoiceChannel = await guild.channels.create({
    name: `Global・${formattedTotalMatches}`,
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
  const teamAVoiceChannel = await guild.channels.create({
    name: `Equipa 1・${formattedTotalMatches}`,
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
  const teamBVoiceChannel = await guild.channels.create({
    name: `Equipa 2・${formattedTotalMatches}`,
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
    await userProfile.save();
    if (member.voice.channel) await moveToChannel(member, teamAVoiceChannel);
  }
  for (let playerMatch of teamB) {
    const member = interaction.guild.members.cache.get(playerMatch.id);
    const userProfile = await User.findOrCreate(member.id);

    await userProfile.originalChannels.push({
      channelId: member.voice.channelId,
      matchId: match._id,
    });
    await userProfile.save();
    if (member.voice.channel) await moveToChannel(member, teamBVoiceChannel);
  }
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
  const embedTeamA = formatTeam(teamA, teamA.length),
    embedTeamB = formatTeam(teamB, teamB.length);

  // Embed for the match channel
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

  // Buttons
  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`select_menu-${match._id}`)
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Definir Criador")
          .setValue(`creator-${match._id}`)
          .setEmoji("<:emoji_13:1361026264449679551>"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Definir Mvp")
          .setValue(`mvp-${match._id}`)
          .setEmoji("<:74:1361026016771965069>"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Definir Vencedor")
          .setValue(`winner-${match._id}`)
          .setEmoji("<a:yellow_trofeu:1360606464946868445>"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Encerrar partida")
          .setEmoji("<:5483discordticemoji:1361026395601371267>")
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
        .setTitle(`Partida ${matchType} criada com sucesso!`)
        .setColor(Colors.LightGrey)
        .setDescription(
          `Vai para o [canal](https://discord.com/channels/1336809872884371587/${matchChannel.id}) da partida e divirta-se!`
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

  await match.save();
  return matchChannel;
};

// 🔹 Helper function to shuffle teams
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

// 🔹 Function to randomize teams
function randomizeTeams(players) {
  let shuffledPlayers = shuffleArray([...players]); // Clone and shuffle players
  let half = Math.ceil(shuffledPlayers.length / 2);
  return {
    teamA: shuffledPlayers.slice(0, half),
    teamB: shuffledPlayers.slice(half),
  };
}

function formatTeam(team, size) {
  return Array.from({ length: size }, (_, i) =>
    team[i]
      ? `${i == 0 || i == (size - 1) ? "**Capitão**" : "**Jogador:** "} <@${team[i].id
      }>`
      : "Slot vazio"
  ).join("\n");
}
