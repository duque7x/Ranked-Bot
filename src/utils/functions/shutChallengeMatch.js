const Match = require("../../structures/database/match");
const { EmbedBuilder, Colors, PermissionFlagsBits } = require("discord.js");

module.exports = async function shutMatch_handler(interaction, match) {
    const userId = interaction.user.id;

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

    const updatedEmbed = new EmbedBuilder()
        .setTitle("Partida encerrada com successo!")
        .setDescription(`Partida encerrada por <@${userId}>\n-# Esta partida sera apagada da base de dados.`)
        .setTimestamp()
        .setColor(Colors.DarkVividPink);

    const msg = await interaction.message.edit({ embeds: [updatedEmbed], components: [] });

    setTimeout(async () => {
        match.status = "shutted";
        await match.deleteOne();
        await msg.delete();
        await match.save();
    }, 2000);
};

