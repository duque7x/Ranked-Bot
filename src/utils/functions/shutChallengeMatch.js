const Match = require("../../structures/database/match");
const { EmbedBuilder, Colors, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = async function shutMatch_handler(interaction, match) {
    const userId = interaction.user.id;
    if (match.creatorId !== userId && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Você não pode encerrar esta partida.")
                    .setDescription(`<@${userId}> você não tem permissões.`)
                    .setTimestamp()
                    .setColor(0xff0000)
            ],
            flags: 64
        });
    }

    const updatedEmbed = new EmbedBuilder()
        .setTitle("Partida encerrada com successo!")
        .setDescription(`Partida encerrada por <@${userId}>\n-# Esta partida sera apagada da base de dados.`)
        .setTimestamp()
        .setColor(Colors.DarkGrey);

    const disabledComponents = interaction.message.components.map(row => {
        return new ActionRowBuilder().addComponents(
            row.components.map(component =>
                StringSelectMenuBuilder.from(component).setDisabled(true)
            )
        );
    });
    const newEmbed = EmbedBuilder.from(interaction.message.embeds[0]).setTitle(`Fila ${match.matchType} | Encerrada`).setColor(Colors.NotQuiteBlack);
    await interaction.message.edit({ embeds: [newEmbed], components: disabledComponents });

    const msg = await interaction.reply({ embeds: [updatedEmbed], components: [] });

    setTimeout(async () => {
        match.status = "shutted";
        await match.deleteOne();
        await msg.delete();
    }, 5000);
};

