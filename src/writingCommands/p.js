const { PermissionFlagsBits, Message, EmbedBuilder } = require("discord.js");
const { returnUserRank } = require("../utils/utils");
const Match = require("../structures/database/match");

module.exports = {
  name: "p", // Command name

  /**
   * @param {Message} message
   * @param {string[]} args
   * @param {BotClient} client
   */
  async execute(message, args, client) {
    try {
      const isAllowed = await Match.findById(message.channel.topic);
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
      let user = message.guild.members.cache.get(args[0])?.user ?? message.author;
      return returnUserRank(user, message, "send");
    } catch (error) {
      console.error(error);
    }
  },
};