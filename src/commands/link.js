const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const myColours = require("../structures/colours");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("link")
        .setDescription("Manda uma embed com o link do servidor.")
        .addChannelOption(op =>
            op.setName("aonde")
                .setDescription("Canal que o link sera enviado")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: "# Você não tem permissões.", flags: 64 });


        const link = "https://discord.gg/swagranked";
        const channel = interaction.options.getChannel("aonde") ?? interaction.channel;

        const embed = new EmbedBuilder()
            .setDescription(`# ${link}`)
            .setColor(myColours.bright_blue_ocean)
            .setTimestamp()
            .setFooter({ text: `Por ${interaction.user.username}` });

        const linkButton = new ButtonBuilder()
            .setEmoji("🔗")
            .setStyle(ButtonStyle.Link)
            .setURL(link)
            .setLabel("DISCORD");

        const row = new ActionRowBuilder().addComponents(linkButton);

        await channel.send({ embeds: [embed], components: [row]});
    }
};
