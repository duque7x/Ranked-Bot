const { EmbedBuilder, ChatInputCommandInteraction, Collection } = require("discord.js");
const User = require("../../structures/database/User");
const moveToChannel = require("./moveToChannel");
const updateRankUsersRank = require("./updateRankUsersRank");

/**
 *
 * @param {*} match
 * @param {ChatInputCommandInteraction} interaction
 * @returns
 */
module.exports = async (match, interaction) => {
  const channel = interaction.guild.channels.cache.get(match.matchChannel.id);
  /* if (!channel) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Canal da partida")
          .setDescription("Canal da partida não foi encontrado no servidor!\n-# Chame um dos developers")
          .setColor(0xff0000)
          .setTimestamp(),
      ],
    });
  } */
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
  const embed = new EmbedBuilder()
    .setTitle("Finalizando fila...")
    .setDescription(`Parabéns a todos os jogadores, joguem sempre!`)
    .setTimestamp()
    .setFooter({ text: "Bom jogo!" })
    .setColor(0xff0000);

  if (interaction.isChatInputCommand()) interaction.reply({ embeds: [embed], components: [] });
  if (interaction.isButton()) interaction.update({ embeds: [embed], components: [], content: "" });
  const members = new Collection();
  match.players.map(p => members.set(p.id, interaction.guild.members.cache.get(p.id)));

  for (let [_, member] of members) {
    const userProfile = await User.findOrCreate(member.id);
    console.log({ originalChannels: userProfile.originalChannels });
    const userOriginalChannelId = userProfile.originalChannels.find(
      (c) => c.matchId == match._id
    )?.channelId;

    const channelToReturn =
      interaction.guild.channels.cache.get(userOriginalChannelId) ??
      interaction.guild.channels.cache.get("1360296464445866056");
    
    if (member.voice.channel) await moveToChannel(member, channelToReturn);
  }
  for (const c of match.voiceChannels) {
    const vcChannel = interaction.guild.channels.cache.get(c.id);
    if (vcChannel) await vcChannel.delete();
  }

  match.status = "off";
  match.save();

  setTimeout(() => {
    if (channel) channel.delete();
  }, 4000);

  await updateRankUsersRank(members);
  return match;
};
