const { EmbedBuilder, Message, PermissionFlagsBits, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const BotClient = require("..");
const myColous = require("../structures/colours");

module.exports = {
    name: "link", // Command name
    description: "Manda uma embed com o link do server",
    usage: "`!link`",

    /**
     * @param {Message} message 
     * @param {string[]} args 
     * @param {BotClient} client 
     */
    execute(message, args, client) {
        const link = "https://discord.gg/HApztNnbvw";

        const embed = new EmbedBuilder()
        .setDescription(`# ${link}`)
        .setColor(myColous.bright_blue_ocean)
        .setTimestamp()
        .setFooter({ text: "Por APOSTAS" });

        const linkButton = new ButtonBuilder()
        .setEmoji("🔗")
        .setStyle(ButtonStyle.Link)
        .setURL(link)
        .setLabel("DISCORD");

        const row = new ActionRowBuilder().addComponents(linkButton);

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
