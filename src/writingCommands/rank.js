const {
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const Match = require("../structures/database/match");
const { returnServerRank } = require("../utils/utils");

module.exports = {
  name: "rank",

  /**
   * @param {Message} message
   * @param {string[]} args
   * @param {BotClient} client
   */
  async execute(message, args, client) {
    try {
      const isAllowed = message.channel.topic ? await Match.findById(message.channel.topic) : false;
      const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
      const isCorrectChannel = message.channel.id === "1342561854777720845";
      const isMatchChannel = Boolean(isAllowed);

      if (!isAdmin && !isCorrectChannel && !isMatchChannel) {
        return message.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Você não pode usar este comando aqui.")
              .setDescription(`Vá pro canal <#1342561854777720845> e use o comando.`)
              .setTimestamp()
              .setColor(0xff0000),
          ],
        });
      }
      return returnServerRank(message, "send", client);
    } catch (error) {
      console.error(error);
    }
  },
};
