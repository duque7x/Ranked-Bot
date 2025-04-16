const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
} = require("discord.js");
const Config = require("../structures/database/configs");
const createChallengeMatch = require("../utils/functions/createChallengeMatch");
const User = require("../structures/database/User");

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
    const { member, guildId, user, channelId } = interaction;
    const serverConfig = await Config.findOrCreate(guildId);
    const userProfile = await User.findOrCreate(user.id);

    try {
      const isInVoice = !!member.voice.channel;
      const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);
      const hasRole = member.roles.cache.has("1360603166835474529");
      if (serverConfig.state.matches.status === "off") {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Partidas offline")
              .setDescription("As filas estão fechadas de momento!")
              .setColor(0xff0000)
              .setTimestamp(),
          ],
          flags: 64
        });
      }
      if (userProfile.blacklisted === true) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Você está na blacklist")
              .setDescription("Infelizmente o seu id se encontra na blacklist!")
              .setColor(0xff0000)
              .setTimestamp()
              .setFooter({ text: "Para sair abre um ticket!" }),
          ],
          flags: 64,
        });
      }
      if (channelId !== "1360611496731738242" && !isAdmin) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Você não pode criar filas aqui!")
              .setDescription(`Vá pro canal <#1360611496731738242> e crie uma fila!`)
              .setTimestamp()
              .setColor(0xff0000)
          ],
          flags: 64
        });
      }
      if (!isInVoice && !isAdmin) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Canal de voz")
              .setDescription("Você tem que estar conectado a um canal de voz para criar uma fila!")
              .setColor(0xff0000)
              .setTimestamp(),
          ],
          flags: 64,
        });
      }
      if (!hasRole && !isAdmin) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Você não tem permissões para criar filas desafio")
              .setDescription(`Você precisa do cargo <@&1360603166835474529> para criar filas desafio!`)
              .setColor(0xff0000)
              .setFooter({ text: `Para adquirir o cargo, basta abrir um ticket!` })
              .setTimestamp(),
          ],
          flags: 64,
        });
      }

      const matchType = interaction.options.getSubcommand();
      const channelToSend = interaction.channel;

      return await createChallengeMatch(
        interaction,
        channelToSend,
        matchType,
        true,
        interaction.user
      );

    } catch (err) {
      console.error("Erro ao criar fila:", err);

      await interaction.reply({
        content: "-# Ocorreu um erro ao criar esta fila!",
        flags: 64,
      })
    }
  },
};
