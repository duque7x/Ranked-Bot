const { EmbedBuilder, Colors } = require("discord.js");

module.exports = {
    matchOff: new EmbedBuilder()
        .setTitle("Partida offline")
        .setDescription("Esta partida não se encontra na base de dados")
        .setColor(0xff0000)
        .setTimestamp()
}