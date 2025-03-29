const { Message, PermissionFlagsBits } = require("discord.js");
const { returnUserRank } = require("../utils/utils");
const verifyChannel = require("../utils/functions/verifyChannel");

module.exports = {
    name: "p", // Command name

    /**
     * @param {Message} message 
     * @param {string[]} args 
     * @param {BotClient} client 
     */
    async execute(message, args, client) {
        const verified = verifyChannel({
            allowedChannelId: "1342561854777720845",
            channelId: message.channel.id,
            event: message,
            isAdmin: message.member.permissions.has(PermissionFlagsBits.Administrator),
            name: "profile"
        });
        if (verified) return;

        return returnUserRank(message.author, message, "send");
    }
};
