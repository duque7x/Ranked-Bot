const { Message, PermissionFlagsBits } = require("discord.js");
const { returnServerRank } = require("../utils/utils");
const verifyChannel = require("../utils/functions/verifyChannel");
module.exports = {
    name: "rank", // Command name

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
            name: "rank"
        });
        if (verified) return;
        return returnServerRank(message);
    }
};
