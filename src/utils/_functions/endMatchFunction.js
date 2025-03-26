const { EmbedBuilder, Colors, ChannelManager } = require("discord.js");

module.exports = async (match, interaction) => {
    const channel = interaction.guild.channels.cache.get(match.matchChannel.id);
    if (!channel) return console.error("Erro: O canal não foi encontrado.");

    const endMatchEmbed = new EmbedBuilder()
        .setDescription(`Fechando a partida...`)
        .setTimestamp()
        .setColor(0xff0000)

    match.voiceChannels.forEach(async c => {
        const vcChannel = interaction.guild.channels.cache.get(c.id);
        await vcChannel.delete();
    });


    match.status = "off";
    await match.save();
    await interaction.reply({ embeds: [endMatchEmbed] });

    setTimeout(() => {
        channel.delete();
    }, 4000);

    return match;
}