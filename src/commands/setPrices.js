const { EmbedBuilder, Message, PermissionFlagsBits, Colors, ActionRowBuilder } = require("discord.js");
const BotClient = require("..");

module.exports = {
    name: "delete_apostas_channels", // Command name
    usage: "`!delete_apostas_channels`",
    description: "Este comando apaga os canais de apostas!",
    users: ["877598927149490186"],

    /**
     * @param {Message} message 
     * @param {string[]} args 
     * @param {BotClient} client 
     */
    async execute(message, args, client) {
        if (!message.author.id !== this.users[0]) return;
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

