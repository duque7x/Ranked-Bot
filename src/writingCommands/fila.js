const { Message, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { returnUserRank, createMatch } = require("../utils/utils");
const Config = require("../structures/database/configs");
const User = require("../structures/database/User");

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

        if (message.channelId !== "1353098806123827211" && !message.member.permissions.has(PermissionFlagsBits.Administrator))
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Você não pode criar filas neste canal`)
                        .setTimestamp()
                        .setColor(0xff0000)
                ]
            });

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

        if (!["1x1", "2x2", "3x3", "4x4", "5x5"].includes(matchType)) {
            await message.reply({
                embeds:
                    [new EmbedBuilder()
                        .setTitle("Tipo da aposta não compativel!")
                        .setDescription("Tipos disponiveis: `1x1, 2x2, 3x3, 4x4, 5x5`")
                        .setTimestamp()
                        .setColor(0xff0000)
                    ]
            });

        }
        await createMatch(message, message.channel, matchType, true, message.author);
    }
};
