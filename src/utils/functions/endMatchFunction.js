const { EmbedBuilder, Collection } = require("discord.js");
const User = require("../../structures/database/User");
const moveToChannel = require("./moveToChannel");
const updateRankUsersRank = require("./updateRankUsersRank");

const FALLBACK_CHANNEL_ID = "1367214550281355264";

module.exports = async (match, interaction) => {
  if (!match) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Partida offline")
          .setDescription("Esta partida não se encontra na base de dados\n-# Chame um dos developers")
          .setColor(0xff0000)
          .setTimestamp(),
      ],
      flags: 64,
    });
  }

  const matchChannel = interaction.guild.channels.cache.get(match.matchChannel?.id);
  const finishEmbed = new EmbedBuilder()
    .setTitle("Finalizando fila...")
    .setDescription("Parabéns a todos os jogadores, joguem sempre!")
    .setFooter({ text: "Bom jogo!" })
    .setColor(0xff0000)
    .setTimestamp();

  if (interaction.isChatInputCommand()) {
    await interaction.reply({ embeds: [finishEmbed], components: [] });
  } else if (interaction.isButton()) {
    await interaction.update({ embeds: [finishEmbed], components: [], content: "" });
  }

  const members = new Collection();
  for (const player of match.players) {
    const member = interaction.guild.members.cache.get(player.id);
    if (member) members.set(player.id, member);
  }

  for (const member of members.values()) {
    try {
      const user = await User.findOrCreate(member.id);
      const originalChannelId = user.originalChannels.find(c => c.matchId === match._id)?.channelId;
      const returnChannel = interaction.guild.channels.cache.get(originalChannelId) ||
        interaction.guild.channels.cache.get(FALLBACK_CHANNEL_ID);
      if (member.voice.channel && returnChannel) {
        await moveToChannel(member, returnChannel);
      }
    } catch (err) {
      console.error(`Erro ao mover ${member.user.tag}:`, err);
    }
  }

  for (const { id } of match.voiceChannels || []) {
    const voiceChannel = interaction.guild.channels.cache.get(id);
    if (voiceChannel) await voiceChannel.delete().catch(console.error);
  }

  match.status = "off";
  await match.save().catch(console.error);

  setTimeout(() => {
    if (matchChannel) matchChannel.delete().catch(console.error);
  }, 4000);

  await updateRankUsersRank(members);
  return match;
};
