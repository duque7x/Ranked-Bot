const { EmbedBuilder, Colors } = require("discord.js");

class Embeds {
    betsOff = new EmbedBuilder()
        .setTitle("Apostas não disponíveis")
        .setDescription("-# Aguarde um momento...")
        .setTimestamp()
        .setColor(Colors.DarkRed);

}

module.exports = new Embeds;