const { PermissionFlagsBits, EmbedBuilder, Colors } = require("discord.js");

module.exports = async (match, winners) => {
    match.winner = winners;
    match.status = "off";
    await match.save();

    for (let user of winners) {
        await require("./addWin")(user);
    }
}