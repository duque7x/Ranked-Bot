const { EmbedBuilder, Colors, ChannelManager } = require("discord.js");

module.exports = async (match, interaction) => {
    const channel = interaction.guild.channels.cache.get(match.matchChannel.id);
    if (!channel) return console.error("Erro: O canal não foi encontrado.");

    if (!match || match.status == "off") {
        return interaction.replied || interaction.deffered ? interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Partida offline")
                    .setDescription("Esta partida não se encontra na base de dados")
                    .setColor(0xff0000)
                    .setTimestamp()
            ],
            flags: 64
        }) : interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Partida offline")
                    .setDescription("Esta partida não se encontra na base de dados")
                    .setColor(0xff0000)
                    .setTimestamp()
            ],
            flags: 64
        });
    }

    if (match.winnerTeam.length == 0) {
        return interaction.replied || interaction.deffered ? interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Vencedores não definidos")
                    .setDescription("Os vencedores desta partida não foram definidos")
                    .setColor(0xff0000)
                    .setTimestamp()
            ],
            flags: 64
        }) : interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Vencedores não definidos")
                    .setDescription("Os vencedores desta partida não foram definidos")
                    .setColor(0xff0000)
                    .setTimestamp()
            ],
            flags: 64
        });
    }
    if (!match.mvp) {
        return interaction.replied || interaction.deffered ? interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("MVP não definido")
                    .setDescription("O MVP desta partida não foi definido")
                    .setColor(0xff0000)
                    .setTimestamp()
            ],
            flags: 64
        }) : interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("MVP não definido")
                    .setDescription("O MVP desta partida não foi definido")
                    .setColor(0xff0000)
                    .setTimestamp()
            ],
            flags: 64
        });
    }
    if (!match.roomCreator) {
        interaction.replied || interaction.deffered ? interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Criador não definido")
                    .setDescription("O criador(da sala no jogo) não foi definido")
                    .setColor(0xff0000)
                    .setTimestamp()
            ],
            flags: 64
        }) : interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Criador não definido")
                    .setDescription("O criador(da sala no jogo) não foi definido")
                    .setColor(0xff0000)
                    .setTimestamp()
            ],
            flags: 64
        });
    }
    await interaction.replied || interaction.deffered ? interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setDescription(`Fechando esta partida...`)
                .setTimestamp()
                .setFooter({ text: "Bom jogo!" })
                .setColor(0xff0000)
        ]
    }) : interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setDescription(`Fechando esta partida...`)
                .setTimestamp()
                .setFooter({ text: "Bom jogo!" })
                .setColor(0xff0000)
        ]
    });

    match.voiceChannels.forEach(async c => {
        const vcChannel = interaction.guild.channels.cache.get(c.id);
        await vcChannel.delete();
    });

    match.status = "off";
    await match.save();

    setTimeout(() => {
        channel.delete();
    }, 4000);
    return match;
}