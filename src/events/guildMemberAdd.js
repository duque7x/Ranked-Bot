const { EmbedBuilder, Colors } = require("discord.js");
const User = require("../structures/database/User");
const Config = require("../structures/database/configs");

module.exports = class {
  constructor(client) {
    this.name = "guildMemberAdd";
    this.client = client;
  }
  /**
   *
   * @param {GuildMember} member - The member who joined the guild
   */
  async execute(member) {
    if (member.user.bot) return;
    const config = await Config.findOne({ "guild.id": member.guild.id });

    const defaultRole = member.guild.roles.cache.get("1338983241759064228");
    const defaultChannel =
      member.guild.channels.cache.get("1339003136907415642") ||
      member.guild.channels.cache.find((c) => c.name.includes("welcome"));

    if (defaultRole && defaultChannel) {
      try {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: member.user.username,
            iconURL: member.user.displayAvatarURL(),
          })
          .setDescription(
            `**Bem-vindo(a) ${member.guild.name.toUpperCase()} <@${member.user.id}>**`
          )
          .addFields([
            {
              name: `Não sabes como as coisas funcionam?:`,
              value: `Antes de tudo lê as [regras](https://discord.com/channels/1336809872884371587/1338244626984992788)!`,
              inline: true,
            },
            {
              name: `Não sabes como jogar?`,
              value: `Para jogar basta adquirires o cargo \<@&1350144276834680912> e criares filas!`,
              inline: true,
            },
            {
              name: `Tens alguma duvida?`,
              value: `Não hesite em abrir um [ticket](https://discord.com/channels/1336809872884371587/1359973537883885598)!`,
              inline: true,
            },
          ])
          .setThumbnail(member.user.displayAvatarURL())
          .setColor(Colors.DarkGrey)
          .setTimestamp();

        await User.findOneAndUpdate(
          { "player.id": member.id },
          {
            $setOnInsert: {
              player: { id: member.id, name: member.displayName },
            },
          },
          { upsert: true, new: true }
        );


        await member.roles.add(defaultRole);
        //await member.roles.add(config.seasonRoleId);
        console.log(`# Default role assigned to ${member.user.tag}.`);
        defaultChannel.send({ content: `<@${member.id}>`, embeds: [embed] });
      } catch (error) {
        console.error(`Failed to assign role to ${member.user.tag}:`, error);
      }
    }
  }
};
