const { EmbedBuilder, Colors } = require("discord.js");

module.exports = async (bet, interaction) => {
    const channel = interaction.guild.channels.cache.get(bet.betChannel.id);
    if (!channel) return console.error("Erro: O canal não foi encontrado.");

    bet.status = "off";
    await bet.save();

    const newEmbed = new EmbedBuilder()
        .setDescription(`## Aposta fechada por <@${interaction.user.id}>\nObrigado por jogar na **BLOOD APOSTAS 🩸**\n\n-# Volte sempre.`)
        .setTimestamp()
        .setColor(0xff0000)
        .setThumbnail(interaction.user.displayAvatarURL({ extension: "png", size: 512 }))
        .setFields();

    await channel.permissionOverwrites.edit(bet.players[0], {
        ViewChannel: false
    });

    await channel.permissionOverwrites.edit(bet.players[1], {
        ViewChannel: false
    });
    await channel.setName(channel.name.replace("💎", "🔒"));

    return await interaction.reply({ embeds: [newEmbed] });
}