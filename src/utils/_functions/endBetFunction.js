const { EmbedBuilder, Colors } = require("discord.js");

module.exports = async (bet, interaction) => {
    const channel = interaction.guild.channels.cache.get(bet.betChannel.id);
    if (!channel) return console.error("Erro: O canal não foi encontrado.");

    bet.status = "off";
    await bet.save();

    const newEmbed = EmbedBuilder.from(interaction.message.embeds[0])
        .setDescription(`## Aposta fechada pr <@${interaction.user.id}>\nObrigado por jogar na **BLOOD APOSTAS 🩸**\n\n-# Volte sempre.`)
        .setColor(Colors.White)
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