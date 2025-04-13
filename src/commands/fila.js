const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChatInputCommandInteraction } = require("discord.js");
const Config = require("../structures/database/configs");
const { createMatch } = require("../utils/utils");
const User = require("../structures/database/User");

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
    const { member, guildId, user, channelId } = interaction;
    const serverConfig = await Config.findOne({ "guild.id": guildId });
    const userProfile = await User.findOrCreate(user.id);

    try {
      const isInVoice = !!member.voice.channel;
      const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);

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
      if (channelId !== "1353098806123827211" && !isAdmin) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Você não pode criar filas aqui!")
              .setDescription(`Vá pro canal <#1353098806123827211> e crie uma fila!`)
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
      if (!member.roles.cache.has("1350144276834680912") && !isAdmin) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Você não tem permissões para criar filas")
              .setDescription(`Você precisa do cargo <@&1350144276834680912> para criar filas!`)
              .setColor(0xff0000)
              .setFooter({ text: `Para adquirir o cargo basta você abrir um ticket!` })
              .setTimestamp(),
          ],
          flags: 64,
        });
      }

      const matchType = interaction.options.getSubcommand();
      const channelToSend = interaction.channel;

      return await createMatch(
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
