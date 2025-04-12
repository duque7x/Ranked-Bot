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
  if (!channel) {
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
  }

  interaction.message
    ? await interaction.message.edit({
        embeds: [
          new EmbedBuilder()
            .setTitle("Fim da fila")
            .setDescription(`Fechando esta partida...`)
            .setTimestamp()
            .setFooter({ text: "Bom jogo!" })
            .setColor(0xff0000),
        ],
        components: [],
      })
    : interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Fim da fila")
            .setDescription(`Fechando esta partida...`)
            .setTimestamp()
            .setFooter({ text: "Bom jogo!" })
            .setColor(0xff0000),
        ],
        components: [],
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
          interaction.guild.channels.cache.get("1338123702633627688");

        if (member.voice.channel) await moveToChannel(member, channelToReturn);
      })
    );

    // Delete the voice channel after the operations are completed
    await vcChannel.delete();
  }

  match.status = "off";
  await match.save();

  setTimeout(() => {
    channel.delete();
  }, 4000);
  return match;
};
