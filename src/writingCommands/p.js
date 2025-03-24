const { Message } = require("discord.js");
const { returnUserRank } = require("../utils/utils");
const verifyChannel = require("../utils/_functions/verifyChannel");

module.exports = {
    name: "p", // Command name

    /**
     * @param {Message} message 
     * @param {string[]} args 
     * @param {BotClient} client 
     */
    async execute(message, args, client) {
        await verifyChannel({ allowedChannelId: "1342561854777720845", channelId: interaction.channel.id, event: "user_rank", isAdmin: interaction.member.permissions.has(PermissionFlagsBits.Administrator), name: "fila" });

        return returnUserRank(message.author, message, "send");
    }
};
