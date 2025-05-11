const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  Colors,
} = require("discord.js");
const quantityChoices = [
  {
    name: "1",
    value: 1,
  },
  {
    name: "5",
    value: 5,
  },
  {
    name: "10",
    value: 10,
  },
  {
    name: "15",
    value: 15,
  },
  {
    name: "20",
    value: 20,
  },
  {
    name: "30",
    value: 30,
  },
  {
    name: "50",
    value: 50,
  },
  {
    name: "100",
    value: 100,
  },
];
const Config = require("../structures/database/configs");
const BotClient = require("..");

/**
 * @type {import('discord.js').SlashCommandBuilder}
 */
module.exports = {
  data: new SlashCommandBuilder()
    .setName("vitorias")
    .setDescription("Este comando adiciona ou remove vitórias de um usuário.")
    .addSubcommand((cmd) =>
      cmd
        .setName("adicionar")
        .setDescription("Adiciona vitórias")
        .addUserOption((op) =>
          op.setName("usuario").setDescription("Usuário a ser manipulado")
        )
        .addNumberOption((op) =>
          op
            .setName("quantidade")
            .setDescription("Número de vitórias a adicionar/remover")
            .addChoices(quantityChoices)
        )
    )
    .addSubcommand((cmd) =>
      cmd
        .setName("remover")
        .setDescription("Remove vitórias")
        .addUserOption((op) =>
          op.setName("usuario").setDescription("Usuário a ser manipulado")
        )
        .addNumberOption((op) =>
          op
            .setName("quantidade")
            .setDescription("Número de vitórias a adicionar/remover")
            .addChoices(quantityChoices)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {BotClient} client
   */
  async execute(interaction, client) {
    const userSelected = interaction.options.getUser("usuario") ?? interaction.user;
    const quantity = interaction.options.getNumber("quantidade") ?? 1;
    const subcommand = interaction.options.getSubcommand();
    const config = await Config.findOne({ "guild.id": interaction.guildId });

    let wins;
    const user = client.api.users.cache.get(userSelected.id);
    const { wins: winsBefore, points: pointsBefore } = user;

    if (subcommand === "adicionar") {
      wins = await user.increment("wins", quantity);
      await user.increment("points", quantity * config.points.win);
    } else if (subcommand === "remover") {
      wins = await user.decrement("wins", quantity);
      await user.decrement("points", quantity * config.points.win);
    }
    
    const embed = new EmbedBuilder()
      .setColor(subcommand === "adicionar" ? Colors.LightGrey : 0xff0000)
      .setTitle(`Perfil de ${userSelected.username} atualizado`)
      .setFields(
        {
          name: "Vitórias",
          value: `${winsBefore} ▬ **${wins}**`,
        },
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
