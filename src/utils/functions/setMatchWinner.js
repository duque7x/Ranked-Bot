const User = require("../../structures/database/User");
const Config = require("../../structures/database/configs");


module.exports = async (match, winners, guildId) => {
    const config = await Config.findOne({ "guild.id": guildId });
    match.winnerTeam = winners;
    await match.save();
    const promises = winners.map(async (user) => {
        const userProfile = await User.findOrCreate(user.id);

        const hasValidProtection = userProfile.protections.some(p =>
            (p.type === "double_points") && p.longevity !== 0
        );

        if (hasValidProtection) {
            await require("./addPoints")(user.id, config.points.win * 2);
        } else {
            await require("./addPoints")(user.id, config.points.win)
        }
        
        await require("./addWin")(user.id);
        await require("./addGamePlayed")(user.id, match._id);

        await userProfile.save();
    });

    await Promise.all(promises);
    return { match, winners }
}