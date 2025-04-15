const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js")

module.exports = match => {
    return new StringSelectMenuBuilder()
        .setCustomId(`select_menu-${match._id}`)
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel("Definir Criador")
                .setValue(`creator-${match._id}`)
                .setEmoji("<:emoji_13:1361026264449679551>"),
            new StringSelectMenuOptionBuilder()
                .setLabel("Definir Mvp")
                .setValue(`mvp-${match._id}`)
                .setEmoji("<:74:1361026016771965069>"),
            new StringSelectMenuOptionBuilder()
                .setLabel("Definir Vencedor")
                .setValue(`winner-${match._id}`)
                .setEmoji("<a:yellow_trofeu:1360606464946868445>"),
            new StringSelectMenuOptionBuilder()
                .setLabel("Encerrar partida")
                .setEmoji("<:5483discordticemoji:1361026395601371267>")
                .setValue(`end_match-${match._id}`)
        )
}