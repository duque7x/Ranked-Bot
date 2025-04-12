const Match = require("../../structures/database/match");
const { EmbedBuilder, Colors, PermissionFlagsBits } = require("discord.js");

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
    });
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

    match.status = "shutted";
    match.save();

    const updatedEmbed = new EmbedBuilder()
        .setTitle("Partida encerrada com successo!")
        .setDescription(`Partida encerrada por <@${userId}>\n-# Esta partida sera apagada da base de dados.`)
        .setTimestamp()
        .setColor(Colors.DarkButNotBlack);

    await interaction.message.edit({ embeds: [updatedEmbed], components: [] });

    setTimeout(async () => {
        await match.deleteOne();
    }, 2000);

    return;
};

