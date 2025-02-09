const { EmbedBuilder, Message, PermissionFlagsBits, Colors, ActionRowBuilder } = require("discord.js");
const BotClient = require("..");

module.exports = {
    name: "setPrices", // Command name

    /**
     * @param {Message} message 
     * @param {string[]} args 
     * @param {BotClient} client 
     */
    async execute(message, args, client) {
        const channels = message.guild.channels.cache.filter(c => c.name.includes("emulador") || c.name.includes("mobile") || c.name.includes("mistas"));

        channels.forEach(async c => {
            c.delete()
        })

    },
    sendTemporaryMessage(msg, content) {
        msg.reply(content).then(mg => {
            setTimeout(() => {
                mg.delete();
            }, 2000);
        });
    },
    
};

