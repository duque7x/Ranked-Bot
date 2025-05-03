const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} = require("discord.js");
const { returnUserRank } = require("../utils/utils");
const Match = require("../structures/database/match");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("perfil")
    .setDescription("Manda embed com as suas estatisticas")
    .addUserOption((option) =>
      option.setName("usuario").setDescription("Usuario para mandar o perfil")
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @returns
   */
  async execute(interaction, client) {
    const isAllowed = await Match.findById(interaction.channel.topic);
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
    const isCorrectChannel = interaction.channel.id === "1342561854777720845";
    const isMatchChannel = Boolean(isAllowed);

    if (!isAdmin && !isCorrectChannel && !isMatchChannel) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Você não pode usar este comando aqui.")
            .setDescription(`Vá pro canal <#1342561854777720845> e use o comando.`)
            .setTimestamp()
            .setColor(0xff0000),
        ],
      });
    }
    const user = interaction.options.getUser("usuario") ?? interaction.user;
    return returnUserRank(user, interaction, "send", client);
  },
};
