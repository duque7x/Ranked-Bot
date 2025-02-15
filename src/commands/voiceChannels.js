const { EmbedBuilder, Message, PermissionFlagsBits, Colors, ActionRowBuilder, ChannelType } = require("discord.js");
const BotClient = require("..");

module.exports = {
    name: "voiceChannels", // Command name
    usage: "`!voiceChannels`",
    description: "Cria canais de vos",
    /**
     * @param {Message} message 
     * @param {string[]} args 
     * @param {BotClient} client 
     */
    async execute(message, args, client) {
        const { guild, member } = message;
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        guild.channels.cache.filter(c => c.name.startsWith("🩸・JOGANDO・")).forEach(c => c.delete())

        const parentChannel = guild.channels.cache.get("1338988719914618892");

        for (let index = 1; index < 16; index++) {
            guild.channels.create({
                name: `apostas・on・${index}`,
                type: ChannelType.GuildVoice,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.SendMessages],
                        allow: [PermissionFlagsBits.Speak]
                    }
                ],
                parent: parentChannel.id
            });

        }
    },
    sendTemporaryMessage(msg, content) {
        msg.reply(content).then(mg => {
            setTimeout(() => {
                mg.delete();
            }, 2000);
        });
    }
};