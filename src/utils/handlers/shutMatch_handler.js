const Match = require("../../structures/database/match");
const { EmbedBuilder, Colors, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = async function shutMatch_handler(interaction, matchId) {
    let match = await Match.findOne({ "_id": matchId });
    const userId = interaction.user.id;

    if (!match) return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setTitle("Partida offline")
                .setDescription("Esta partida não se encontra na base de dados")
                .setColor(0xff00000)
                .setTimestamp()
        ]
    })
    if (match.creatorId !== userId && !interaction.member.permissions.has(PermissionFlagsBits.Administrator))
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
    
    const disabledComponents = interaction.message.components.map(row => {
        return new ActionRowBuilder().addComponents(
            row.components.map(component =>
                ButtonBuilder.from(component).setDisabled(true)
            )
        );
    });
    const newEmbed = EmbedBuilder.from(interaction.message.embeds[0]).setTitle(`Fila ${match.matchType} | Encerrada`).setColor(Colors.NotQuiteBlack);
    await interaction.message.edit({ embeds: [newEmbed], components: disabledComponents });

    const updatedEmbed = new EmbedBuilder()
        .setTitle("Partida encerrada")
        .setDescription(`Partida encerrada por <@${userId}>\n-# Esta partida será apagada da base de dados`)
        .setTimestamp()
        .setColor(Colors.DarkGrey);

    const msg = await interaction.reply({ embeds: [updatedEmbed], components: [] });

    setTimeout(async () => {
        await match.deleteOne();
        await msg.delete();
    }, 5000);
    return;
};

