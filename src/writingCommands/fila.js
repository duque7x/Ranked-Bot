const { Message, EmbedBuilder } = require("discord.js");
const { returnUserRank, createMatch } = require("../utils/utils");

module.exports = {
    name: "fila", // Command name

    /**
     * @param {Message} message 
     * @param {string[]} args 
     * @param {BotClient} client 
     */
    async execute(message, args, client) {
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
