const { EmbedBuilder, Colors } = require("discord.js");

module.exports = async (team, match, interaction) => {
    match.status = "on";
    match.winnerTeam = "";
    await match.save();

    for (let user of team) {
        let userId = user.id;
        await (require("./removePoints"))(userId, 100);
        await (require("./removeWin"))(userId, 1);
    }
}