const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  Colors,
} = require("discord.js");

const addMvp = require("../utils/functions/addMvp");
const removeMvp = require("../utils/functions/removeMvp");
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
    .setName("mvps")
    .setDescription("Este comando adiciona ou remove mvps de um usuário.")
    .addSubcommand((cmd) =>
      cmd
        .setName("adicionar")
        .setDescription("Adiciona mvps")
        .addUserOption((op) =>
          op.setName("usuario").setDescription("Usuário a ser manipulado")
        )
        .addNumberOption((op) =>
          op
            .setName("quantidade")
            .setDescription("Número de mvps a adicionar/remover")
            .addChoices(quantityChoices)
        )
    )
    .addSubcommand((cmd) =>
      cmd
        .setName("remover")
        .setDescription("Remove mvps")
        .addUserOption((op) =>
          op.setName("usuario").setDescription("Usuário a ser manipulado")
        )
        .addNumberOption((op) =>
          op
            .setName("quantidade")
            .setDescription("Número de mvps a adicionar/remover")
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

    let mvps;

    if (subcommand === "adicionar") {
      mvps = (await addMvp(user.id, quantity)).mvps;
      await addPoints(user.id, quantity * config.points.mvp);
    } else if (subcommand === "remover") {
      mvps = (await removeMvp(user.id, quantity)).mvps;
      await removePoints(user.id, quantity * config.points.mvp);
    }

    const embed = new EmbedBuilder()
      .setColor(subcommand === "adicionar" ? Colors.LightGrey : 0xff0000)
      .setDescription(
        `# Gerenciador de mvps\n <@${user.id}> agora tem **${mvps}** ${mvps >= 0 && mvps !== 1 ? `mvps` : `mvp`
        }`
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
    return await updateRankUsersRank(await interaction.guild.members.fetch());
  },
};
