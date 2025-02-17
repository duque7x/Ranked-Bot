const { EmbedBuilder, Message, PermissionFlagsBits, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const BotClient = require("..");
const myColours = require("../structures/colours");

module.exports = {
    name: "addRole", // Command name
    description: "Adiciona o tal cargo a pessoa",
    usage: "`!addRole`",

    /**
     * @param {Message} message 
     * @param {string[]} args 
     * @param {BotClient} client 
     */
    execute(message, args, client) {
        const { channel, guild, member, user } = message;
        const role = guild.roles.cache.get(args[0]);
        const roleMentions = guild.roles.cache.map(role => role.name).filter(r => !r.includes("DONO") && !r.includes("everyone")).join(', ');

        if (!role) return message.reply(`Esse cargo não foi **encontrado**! Cargos disponiveis:\n ${roleMentions}!`)

        const embed = new EmbedBuilder()
            .setDescription(`# ${link}`)
            .setColor(myColours.bright_blue_ocean)
            .setTimestamp()
            .setFooter({ text: "Por APOSTAS" });

        message.channel.send({ embeds: [embed], components: [row] });
    },
    sendTemporaryMessage(msg, content) {
        msg.reply(content).then(mg => {
            setTimeout(() => {
                mg.delete();
            }, 2000);
        });
    }
};
