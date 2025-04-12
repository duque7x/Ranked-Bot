const { Message, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { returnUserRank, createMatch } = require("../utils/utils");
const Config = require("../structures/database/configs");
const User = require("../structures/database/User");
const verifyChannel = require("../utils/functions/verifyChannel");

module.exports = {
  name: "fila", // Command name

  /**
   * @param {Message} message
   * @param {string[]} args
   * @param {BotClient} client
   */
  async execute(message, args, client) {
    const isInVoice = !!message.member.voice.channel;
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);

    if (!isInVoice && !isAdmin) {
      return await message.reply({
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
    const { guildId } = message;
    const serverConfig = await Config.findOne({ "guild.id": guildId });
    const verified = verifyChannel({
      allowedChannelId: "1353098806123827211",
      channelId: message.channel.id,
      event: message,
      isAdmin: message.member.permissions.has(
        PermissionFlagsBits.Administrator
      ),
      name: "profile",
    });

    if (verified) return;

    if (serverConfig.state.matches.status === "off") {
      return message.reply({
        content: "-# As filas estão fechadas no momento!",
        flags: 64,
      });
    }

    const matchType = args[0];

    if (!["1x1", "2x2", "3x3", "4x4", "5x5", "6x6"].includes(matchType)) {
      return await message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Tipo da aposta não compativel!")
            .setDescription("Tipos disponiveis: `1x1, 2x2, 3x3, 4x4, 5x5. 6x6`")
            .setTimestamp()
            .setColor(0xff0000),
        ],
      });
    }
    return await createMatch(
      message,
      message.channel,
      matchType,
      true,
      message.author
    );
  },
};
