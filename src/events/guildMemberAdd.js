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

    const defaultRole = member.guild.roles.cache.find((r) =>
      r.name.toLowerCase().includes("membro")
    );
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
            `**Bem vindo(a) a ${member.guild.name.toUpperCase()} <@${member.user.id
            }>**`
          )
          .addFields([
            {
              name: `Não sabes como as coisas funcionam?:`,
              value: `<#1338244626984992788>`,
              inline: true,
            },
            {
              name: `Não sabes como jogar?`,
              value: `Vá ao canal: <#1338985323610374207>\n`,
              inline: true,
            },
            {
              name: `Tens alguma duvida?`,
              value: `Não hesite em solicitar ajuda: <#1339284682902339594>\n`,
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
        await member.roles.add(config.seasonRoleId);
        console.log(`# Default role assigned to ${member.user.tag}.`);
        defaultChannel.send({ embeds: [embed] });
      } catch (error) {
        console.error(`Failed to assign role to ${member.user.tag}:`, error);
      }
    }
  }
};
