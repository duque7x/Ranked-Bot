const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("createembed")
        .setDescription("Cria um embed personalizável.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    /**
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        const embedData = {
            title: "Título Padrão",
            description: "Descrição Padrão",
            color: 0x3498db
        };

        const embed = {
            title: embedData.title,
            description: embedData.description,
            color: embedData.color
        };

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("edit_title")
                .setLabel("Alterar Título")
                .setStyle(1),
            new ButtonBuilder()
                .setCustomId("edit_description")
                .setLabel("Alterar Descrição")
                .setStyle(1),
            new ButtonBuilder()
                .setCustomId("edit_color")
                .setLabel("Alterar Cor")
                .setStyle(1),
            new ButtonBuilder()
                .setCustomId("send_embed")
                .setLabel("Enviar Embed")
                .setStyle(3)
        );

        await interaction.reply({
            content: "🛠️ Use os botões abaixo para personalizar o embed:",
            embeds: [embed],
            components: [buttons],
            flags: 64
        });

        // Store the embed data temporarily
        client.embedSessions.set(interaction.user.id, { embedData, channel: interaction.channel });
    }
};
