const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  Colors,
} = require("discord.js");
const { addWin } = require("../utils/utils");
const removeWin = require("../utils/functions/removeWin");
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
const addPoints = require("../utils/functions/addPoints");
const removePoints = require("../utils/functions/removePoints");
const Config = require("../structures/database/configs");
const updateRankUsersRank = require("../utils/functions/updateRankUsersRank");

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
   */
  async execute(interaction) {
    const user = interaction.options.getUser("usuario") ?? interaction.user;
    const quantity = interaction.options.getNumber("quantidade") ?? 1;
    const subcommand = interaction.options.getSubcommand();
    const config = await Config.findOne({ "guild.id": interaction.guildId });

    let wins;

    if (subcommand === "adicionar") {
      wins = (await addWin(user.id, quantity)).wins;
      await addPoints(user.id, quantity * config.points.win);
    } else if (subcommand === "remover") {
      wins = (await removeWin(user.id, quantity)).wins;
      await removePoints(user.id, quantity * config.points.win);
    }

    const embed = new EmbedBuilder()
      .setColor(subcommand === "adicionar" ? Colors.LightGrey : 0xff0000)
      .setDescription(
        `# Gerenciador de vitórias\n <@${user.id}> agora tem **${wins}** ${wins >= 0 && wins !== 1 ? `vitórias` : `vitória`
        }`
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    return await updateRankUsersRank(await interaction.guild.members.fetch());
  },
};
