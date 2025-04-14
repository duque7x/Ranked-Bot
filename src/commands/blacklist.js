const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  Colors,
} = require("discord.js");
const blacklist_handler = require("../utils/handlers/blacklist_handler");
const Config = require("../structures/database/configs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("blacklist")
    .setDescription("Adiciona ou remove alguem da blacklist")
    .addSubcommand((sub) =>
      sub
        .setName("adicionar")
        .setDescription("Adiciona um jogador a blacklist")
        .addUserOption((option) =>
          option
            .setName("usuário")
            .setDescription("Qual usuário a ser adicionado?")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("remover")
        .setDescription("Remove um jogador da blacklist")
        .addUserOption((option) =>
          option
            .setName("usuário")
            .setDescription("Qual usuário a ser removido?")
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @returns
   */
  async execute(interaction) {
    const { guildId } = interaction;
    const user = interaction.options.getUser("usuário");
    const subCommand = interaction.options.getSubcommand();
    const logChannel =
      interaction.guild.channels.cache.get("1340360434414522389") ||
      interaction.guild.channels.cache.find((c) => c.name.includes("logs"));

    const config = await Config.findOne({ "guild.id": guildId });

    // Reply with initial waiting message
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Fazendo as requisições")
          .setColor(Colors.LightGrey)
          .setDescription("Aguarde um momento...")
          .setTimestamp(),
      ],
      flags: 64,
    });

    // Handle the blacklist actions
    const action = subCommand === "adicionar" ? "add" : "remove";
    const response = await blacklist_handler({
      action,
      guildId: interaction.guildId,
      user,
      adminId: interaction.user.id,
      interaction,
    });

    const embed = new EmbedBuilder()
      .setTimestamp()
      .setThumbnail(user.displayAvatarURL());

    if (subCommand === "adicionar") {
      if (response === true) {
        embed
          .setColor(Colors.DarkerGrey)
          .setDescription(
            `# Gerenciador blacklist\n<@${user.id}> foi adicionado à blacklist!\n\n-# Adicionado por <@${interaction.user.id}>`
          )
          .setFooter({
            text: "Nota: para sair da blacklist você precisa pagar 1,50€",
          });
      } else if (response === "already_in") {
        embed
          .setColor(Colors.DarkGrey)
          .setDescription(
            `# Gerenciador blacklist\n<@${user.id}> já se encontra na blacklist\n\n-# Adicionado por <@${config.blacklist.find(p => p.startsWith(user.id)).split("-")[1] ?? "1355544935662883100"}>`
          );
      }
    } else if (subCommand === "remover" && response === true) {
      embed
        .setColor(Colors.DarkerGrey)
        .setDescription(
          `# Gerenciador blacklist\n<@${user.id}> foi removido da blacklist!\n\n-# Removido por <@${interaction.user.id}>`
        );
    }

    // Send the final reply
    return interaction.editReply({ embeds: [embed] });
  },
};
