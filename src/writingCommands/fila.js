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
        const { guildId } = message;
        const serverConfig = await Config.findOne({ "guild.id": guildId });
        const userProfile = await User.findOne({ "player.id": message.author.id });
        const verified = verifyChannel({
            allowedChannelId: "1342561854777720845",
            channelId: message.channel.id,
            event: message,
            isAdmin: message.member.permissions.has(PermissionFlagsBits.Administrator),
            name: "profile"
        });

        if (verified) return;

        if (serverConfig.state.matchs.status === "off") {
            return message.reply({ content: "-# As filas estão fechadas no momento!", flags: 64 });
        }
        if (userProfile.blacklisted === true)
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setDescription(`O id **${message.author.id}** esta na blacklist.\n-# Abra um ticket <#1339284682902339594> para sair.`)
                    .setTimestamp()
                    .setColor(Colors.Aqua)
                    .setFooter({ text: "Nota: para sair da blacklist você precisa pagar 1,50€" })
                ]
            });
        const matchType = args[0];

        if (!["1x1", "2x2", "3x3", "4x4", "5x5", "6x6"].includes(matchType)) {
            return await message.reply({
                embeds:
                    [new EmbedBuilder()
                        .setTitle("Tipo da aposta não compativel!")
                        .setDescription("Tipos disponiveis: `1x1, 2x2, 3x3, 4x4, 5x5`")
                        .setTimestamp()
                        .setColor(0xff0000)
                    ]
            });

        }
        return await createMatch(message, message.channel, matchType, true, message.author);
    }
};
