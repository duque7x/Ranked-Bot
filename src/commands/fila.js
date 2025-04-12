const {
  SlashCommandBuilder,
  EmbedBuilder,
  Colors,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");
const Config = require("../structures/database/configs");
const { sendMatchEmbed, createMatch } = require("../utils/utils");
const User = require("../structures/database/User");
const verifyChannel = require("../utils/functions/verifyChannel");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fila")
    .setDescription("Cria uma fila")
    .addSubcommand((sub) =>
      sub
        .setName("1x1")
        .setDescription("Cria uma partida, onde outros jogadores podem entrar aleatoriamente")
    )
    .addSubcommand((sub) =>
      sub
        .setName("2x2")
        .setDescription("Cria uma partida, onde outros jogadores podem entrar aleatoriamente")
    )
    .addSubcommand((sub) =>
      sub
        .setName("3x3")
        .setDescription("Cria uma partida, onde outros jogadores podem entrar aleatoriamente")
    )
    .addSubcommand((sub) =>
      sub
        .setName("4x4")
        .setDescription("Cria uma partida, onde outros jogadores podem entrar aleatoriamente")
    )
    .addSubcommand((sub) =>
      sub
        .setName("5x5")
        .setDescription("Cria uma partida, onde outros jogadores podem entrar aleatoriamente")
    )
    .addSubcommand((sub) =>
      sub
        .setName("6x6")
        .setDescription("Cria uma partida, onde outros jogadores podem entrar aleatoriamente")
    ),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @returns
   */
  async execute(interaction) {
    const { member } = interaction;

    try {
      const isInVoice = !!member.voice.channel;
      const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);

      if (!isInVoice && !isAdmin) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Canal de voz")
              .setDescription("Você tem que estar conectado a um canal de voz ou ser administrador para criar uma fila!")
              .setColor(0xff0000)
              .setTimestamp(),
          ],
          flags: 64,
        });
      }
      if (interaction.member.roles.cache.has("1350144276834680912")) {
        const { guildId } = interaction;
        const verified = verifyChannel({
          allowedChannelId: "1353098806123827211",
          channelId: interaction.channel.id,
          event: interaction,
          isAdmin: interaction.member.permissions.has(
            PermissionFlagsBits.Administrator
          ),
          name: "fila",
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

        await createMatch(
          interaction,
          channelToSend,
          matchType,
          true,
          interaction.user
        );
      } else {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Você não tem permissões para criar filas")
              .setDescription(`Você precisa do cargo <@&1350144276834680912> para criar filas!`)
              .setColor(0xff0000)
              .setTimestamp(),
          ],
          flags: 64,
        });
      }
    } catch (err) {
      console.error("Erro ao criar fila:", err);
      interaction.reply({
        content: "-# Ocorreu um erro ao criar a fila!",
        flags: 64,
      })
    }
  },
};
