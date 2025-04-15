const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  Colors,
} = require("discord.js");
const addGamePlayed = require("../utils/functions/addGamePlayed");
const removeGamePlayed = require("../utils/functions/removeGamePlayed");

/**
 * @type {import('discord.js').SlashCommandBuilder}
 */
module.exports = {
  data: new SlashCommandBuilder()
    .setName("partidasjogadas")
    .setDescription("Este comando adiciona ou remove partidas de um usuário.")
    .addSubcommand((cmd) =>
      cmd
        .setName("adicionar")
        .setDescription("Adiciona partidas")
        .addStringOption((op) =>
          op
            .setName("id")
            .setDescription("Id da partidas a adicionar/remover")
            .setRequired(true)
        )
        .addUserOption((op) =>
          op.setName("usuario").setDescription("Usuário a ser manipulado")
        )
    )
    .addSubcommand((cmd) =>
      cmd
        .setName("remover")
        .setDescription("Remove partidas")
        .addStringOption((op) =>
          op
            .setName("id")
            .setDescription("Id da partidas a adicionar/remover")
            .setRequired(true)
        )
        .addUserOption((op) =>
          op.setName("usuario").setDescription("Usuário a ser manipulado")
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  /**
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const user = interaction.options.getUser("usuario") ?? interaction.user;
    const id = interaction.options.getString("id");
    const subcommand = interaction.options.getSubcommand();

    let gamesPlayed;

    if (subcommand === "adicionar") {
      gamesPlayed = (await addGamePlayed(user.id, id)).gamesPlayed;
    } else if (subcommand === "remover") {
      gamesPlayed = (await removeGamePlayed(user.id, id)).gamesPlayed;
    }

    const embed = new EmbedBuilder()
      .setColor(subcommand === "adicionar" ? Colors.LightGrey : 0xff0000)
      .setDescription(
        `# Gerenciador de partidas\n <@${user.id}> agora tem **${
          gamesPlayed.length
        }** ${
          gamesPlayed.length >= 0 && gamesPlayed.length !== 1
            ? `partidas`
            : `partida`
        }`
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  },
};
