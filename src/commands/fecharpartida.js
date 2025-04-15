const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const Match = require("../structures/database/match");
const User = require("../structures/database/User");
const moveToChannel = require("../utils/functions/moveToChannel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fecharpartida")
    .setDescription("Fecha uma determinada partida.")
    .addStringOption((option) =>
      option.setName("id").setDescription("O id da partida").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const match_id = interaction.options.getString("id");
    const match = await Match.findOne({ _id: match_id });
    if (!match) {
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
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Finalizando fila...")
          .setDescription(`Parabéns a todos os jogadores, joguem sempre!`)
          .setTimestamp()
          .setFooter({ text: "Bom jogo!" })
          .setColor(0xff0000)
      ],
      components: [],
      flags: 64
    });


    for (const c of match.voiceChannels) {
      const vcChannel = interaction.guild.channels.cache.get(c.id);
      if (vcChannel) {
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

            if (member.voice.channel)
              await moveToChannel(member, channelToReturn);
          })
        );
        await vcChannel.delete();
      }
    }

    match.status = "off";
    await match.save();
    const channel = interaction.guild.channels.cache.get(match.matchChannel.id);

    setTimeout(() => {
      if (channel) channel.delete();
    }, 4000);
  },
};
