const {
  EmbedBuilder,
  Colors,
  ChannelManager,
  ChatInputCommandInteraction,
} = require("discord.js");
const User = require("../../structures/database/User");
const moveToChannel = require("./moveToChannel");
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
          .setDescription("Canal da partida não foi encontrado no servidor!")
          .setColor(0xff0000)
          .setTimestamp(),
      ],
    });
  }
  if (!match || match.status == "off") {
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
  } */
  const embed = new EmbedBuilder()
    .setTitle("Finalizando fila...")
    .setDescription(`Parabéns a todos os jogadores, joguem sempre!`)
    .setTimestamp()
    .setFooter({ text: "Bom jogo!" })
    .setColor(0xff0000);

  interaction.message
    ? await interaction.message.edit({
      embeds: [embed],
      components: [],
    })
    : interaction.update({
      embeds: [embed],
      components: [],
      content: ""
    });

  for (const c of match.voiceChannels) {
    const vcChannel = interaction.guild.channels.cache.get(c.id);

    // Use Promise.all to wait for all async operations inside the loop
    await Promise.all(
      vcChannel.members.map(async (member) => {
        const userProfile = await User.findOrCreate(member.id);

        // Use find instead of map to find the correct userOriginalChannelId
        const userOriginalChannelId = userProfile.originalChannels.find(
          (c) => c.matchId == match._id
        )?.channelId;
        const channelToReturn =
          interaction.guild.channels.cache.get(userOriginalChannelId) ??
          interaction.guild.channels.cache.get("1360296464445866056");

        if (member.voice.channel) await moveToChannel(member, channelToReturn);
      })
    );

    await vcChannel.delete();
  }
  console.log(match);
  
  match.status = "off";
  await match.save();

  setTimeout(() => {
    if (channel)
      channel.delete();
  }, 4000);
  return match;
};
