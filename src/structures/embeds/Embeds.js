const { EmbedBuilder, Colors } = require("discord.js");

class Embeds {
    betsOff = new EmbedBuilder()
        .setTitle("Apostas OFFLINE")
        .setDescription("-# Aguarde um momento...")
        .setTimestamp()
        .setColor(Colors.White);

}

module.exports = new Embeds;