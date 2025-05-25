const {
  EmbedBuilder,
  Message,
  Colors,
  PermissionFlagsBits,
} = require("discord.js");
const BotClient = require("..");
const Config = require("../structures/database/configs");

module.exports = class MessageEvent {
  /**
   *
   * @param {Client} client
   */
  constructor(client) {
    this.name = "messageCreate";
  }
  /**
   * 
   * @param {Message} message 
   * @param {BotClient} cl
   * @returns 
   */
  async execute(message, cl) {
    if (message.author.bot) return;
    const { member } = message;
    const prefix = "!";
    // Get the command and arguments  
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = cl.prefixCommands.get(commandName);

    if (message.channel.id == "1338575355665186856") {
      if (!/^\d+$/.test(message.content)) return message.delete();

      const serverInfo = await Config.findOne({ "guild.id": message.guildId });
      const blacklist = serverInfo.blacklist;
      if (blacklist.some(id => id.startsWith(message.content))) {
        const embed = new EmbedBuilder()
          .setDescription(`O id **${message.content}** esta na blacklist.\n-# Abra um ticket <#1339284682902339594> para sair.`)
          .setTimestamp()
          .setColor(Colors.Aqua)
          .setFooter({ text: "Nota: para sair da blacklist você precisa pagar 1,50€" });

        message.reply({ embeds: [embed] })
      } else {
        const embed = new EmbedBuilder()
          .setDescription(`O id **${message.content}** não está na blacklist.`)
          .setTimestamp()
          .setColor(Colors.Red)

        message.reply({ embeds: [embed] })
      }
    }
    const hasLinkRole = member.roles.cache.has("1361766445264142346");
    const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator)
    if (this.isLink(message.content) && !isAdmin && !hasLinkRole) {
      console.log(`Mensagem de ${message.author.username} foi apagada, porque contia link! Mensagem: ${message.content}`);
      return message.delete();
    }
    if (!message.content.startsWith(prefix)) return;

    if (!cl.prefixCommands) {
      console.error('prefixCommands collection is not defined!');
      return;
    }

    if (command) {
      command.execute(message, args, cl);
    }
  }
  isLink(content) {
    return /https?:\/\/(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/\S*)?/.test(content);
  }
};
