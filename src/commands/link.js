const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const myColours = require("../structures/colours");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("link")
        .setDescription("Manda uma embed com o link do servidor."),

    /**
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const link = "https://discord.gg/HApztNnbvw";

        const embed = new EmbedBuilder()
            .setDescription(`# ${link}`)
            .setColor(myColours.bright_blue_ocean)
            .setTimestamp()
            .setFooter({ text: "Por APOSTAS" });

        const linkButton = new ButtonBuilder()
            .setEmoji("🔗")
            .setStyle(ButtonStyle.Link)
            .setURL(link)
            .setLabel("DISCORD");

        const row = new ActionRowBuilder().addComponents(linkButton);

        await interaction.reply({ embeds: [embed], components: [row], flags: 64 });
    }
};
