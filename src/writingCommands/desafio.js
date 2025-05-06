const { Message, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const Config = require("../structures/database/configs");
const User = require("../structures/database/User");
const createChallengeMatch = require("../utils/functions/createChallengeMatch");

module.exports = {
  name: "desafio", // Command name

  /**
   * @param {Message} message
   * @param {string[]} args
   * @param {BotClient} client
   */
  async execute(message, args, client) {
    const { member, guildId, author: user, channelId } = message;
    const serverConfig = await Config.findOrCreate(guildId);
    const userProfile = await User.findOrCreate(user.id);
    try {
      const isInVoice = !!member.voice.channel;
      const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);
      const matchType = args[0];
      const hasRole = member.roles.cache.has("1360603166835474529");

      if (serverConfig.state.matches.status === "off") {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Partidas offline")
              .setDescription("As filas estão fechadas de momento!")
              .setColor(0xff0000)
              .setTimestamp(),
          ]
        });
      }
      if (userProfile.blacklisted === true) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Você está na blacklist")
              .setDescription("Infelizmente o seu id se encontra na blacklist!")
              .setColor(0xff0000)
              .setTimestamp()
              .setFooter({ text: "Para sair abre um ticket!" }),
          ],
        });
      }
      /* if (channelId !== "1360611496731738242" && !isAdmin) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Você não pode criar filas aqui!")
              .setDescription(`Vá pro canal <#1360611496731738242> e crie uma fila!`)
              .setTimestamp()
              .setColor(0xff0000)
          ]
        });
      } */
      if (!isInVoice && !isAdmin) {
        return await message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Canal de voz")
              .setDescription("Você tem que estar conectado a um canal de voz para criar uma fila!")
              .setColor(0xff0000)
              .setTimestamp(),
          ],
        });
      }
      if (!hasRole && !isAdmin) {
        return await message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Você não tem permissões para criar filas desafio")
              .setDescription(`Você precisa do cargo <@&1360603166835474529> para criar filas desafio!`)
              .setColor(0xff0000)
              .setFooter({ text: `Para adquirir o cargo basta você abrir um ticket!` })
              .setTimestamp(),
          ],
        });
      }
      const acceptableOptions = ["1x1", "2x2", "3x3", "4x4", "5x5", "6x6","1v1", "2v2", "3v3", "4v4", "5v5", "6v6"];

      if (!acceptableOptions.includes(matchType)) {
        return await message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Tipo da aposta não compativel!")
              .setDescription(`Tipos disponiveis: \`${acceptableOptions.join(", ")}\``)
              .setTimestamp()
              .setColor(0xff0000),
          ],
        });
      }
      return await createChallengeMatch(
        message,
        message.channel,
        matchType,
        true,
        message.author
      );
    } catch (err) {
      console.error("Erro ao criar fila:", err);
      await message.reply({
        content: "-# Ocorreu um erro ao criar esta fila!",
        flags: 64,
      })
    }
  },
};
