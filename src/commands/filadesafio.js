const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");
const Config = require("../structures/database/configs");
const verifyChannel = require("../utils/functions/verifyChannel");
const createChallengeMatch = require("../utils/functions/createChallengeMatch");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("filadesafio")
    .setDescription("Cria uma fila desafio")
    .addSubcommand((sub) =>
      sub
        .setName("1x1")
        .setDescription("Cria uma partida, onde jogadores podem escolher os seus times")
    )
    .addSubcommand((sub) =>
      sub
        .setName("2x2")
        .setDescription("Cria uma partida, onde jogadores podem escolher os seus times")
    )
    .addSubcommand((sub) =>
      sub
        .setName("3x3")
        .setDescription("Cria uma partida, onde jogadores podem escolher os seus times")
    )
    .addSubcommand((sub) =>
      sub
        .setName("4x4")
        .setDescription("Cria uma partida, onde jogadores podem escolher os seus times")
    )
    .addSubcommand((sub) =>
      sub
        .setName("5x5")
        .setDescription("Cria uma partida, onde jogadores podem escolher os seus times")
    )
    .addSubcommand((sub) =>
      sub
        .setName("6x6")
        .setDescription("Cria uma partida, onde jogadores podem escolher os seus times")
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @returns
   */
  async execute(interaction) {
    if (!interaction.member.voice.channel && !interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Canal de voz")
            .setDescription(
              "Você tem que estar conectado a um canal de voz para criar uma fila!"
            )
            .setColor(0xff0000)
            .setTimestamp(),
        ],
        flags: 64,
      });
    }
    const { guildId } = interaction;
    const verified = verifyChannel({
      allowedChannelId: "1360611496731738242",
      channelId: interaction.channel.id,
      event: interaction,
      isAdmin: interaction.member.permissions.has(
        PermissionFlagsBits.Administrator
      ),
      name: "profile",
    });

    if (verified) return;
    const serverConfig = await Config.findOne({ "guild.id": guildId });

    if (serverConfig.state.matches.status === "off") {
      return interaction.reply({
        content: "-# As filas estão fechadas no momento!",
        flags: 64,
      });
    }
    const matchType = interaction.options.getSubcommand();
    const channelToSend = interaction.channel;
    try {
      await createChallengeMatch(
        interaction,
        channelToSend,
        matchType,
        true,
        interaction.user
      );
    } catch (err) {
      console.error("Erro ao criar fila:", err);
      interaction.reply({
        content: "-# Ocorreu um erro ao criar a fila!",
        flags: 64,
      })
    }
  },
};
