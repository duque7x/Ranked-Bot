const { PermissionFlagsBits, EmbedBuilder, Colors } = require("discord.js");

module.exports = async (match, losers) => {
    match.losers = losers;
    await match.save();

    for (let user of losers) {
        await require("./addLoss")(user.id);
        await require("./removePoints")(user.id, 40);
        await require("./addGamePlayed")(user.id, match._id)
    }

    return { match, losers };
}