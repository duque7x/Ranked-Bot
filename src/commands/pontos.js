const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  Colors,
} = require("discord.js");
const addPoints = require("../utils/functions/addPoints");
const removePoints = require("../utils/functions/removePoints");
/**
 * @type {import('discord.js').SlashCommandBuilder}
 */
module.exports = {
  data: new SlashCommandBuilder()
    .setName("pontos")
    .setDescription("Este comando adiciona ou remove pontos de um usuário.")
    .addSubcommand((cmd) =>
      cmd
        .setName("adicionar")
        .setDescription("Adiciona pontos")
        .addUserOption((op) =>
          op.setName("usuario").setDescription("Usuário a ser manipulado")
        )
        .addNumberOption((op) =>
          op
            .setName("quantidade")
            .setDescription("Número de pontos a adicionar/remover")
        )
    )
    .addSubcommand((cmd) =>
      cmd
        .setName("remover")
        .setDescription("Remove pontos")
        .addUserOption((op) =>
          op.setName("usuario").setDescription("Usuário a ser manipulado")
        )
        .addNumberOption((op) =>
          op
            .setName("quantidade")
            .setDescription("Número de pontos a adicionar/remover")
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const userSelected = interaction.options.getUser("usuario") ?? interaction.user;
    const quantity = interaction.options.getNumber("quantidade") ?? 1;
    const subcommand = interaction.options.getSubcommand();

    let points;
    const user = client.api.users.cache.get(userSelected.id);
    const { points: pointsBefore } = user;

    if (subcommand === "adicionar") points = await user.increment("points", quantity);
    else if (subcommand === "remover") points = await user.decrement("points", quantity);

    const embed = new EmbedBuilder()
      .setColor(subcommand === "adicionar" ? Colors.LightGrey : 0xff0000)
      .setTitle(`Perfil de ${userSelected.username} atualizado`)
      .setFields(
        {
          name: "Pontos",
          value: `${pointsBefore} ▬ **${user.points}**`,
        },
      )
      .setThumbnail(userSelected.displayAvatarURL({ dynamic: true, size: 256 }))
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
