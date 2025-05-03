const Config = require("../../structures/database/configs");
const User = require("../../structures/database/User");
const addMvp = require("./addMvp");
const addPoints = require("./addPoints");

module.exports = async (match, guildId, userProfile) => {
    const config = await Config.findOne({ "guild.id": guildId });
    const hasValidProtection = userProfile.protections ? userProfile.protections.some(
        (p) => p.type === "double_points" && p.longevity !== 0
    ) : undefined;

    await userProfile.increment("points", hasValidProtection ? config.points.mvp * 2 : config.points.mvp);

    await addMvp(userProfile.player.id);
    match.mvp = { id: userProfile.player.id };

    await Promise.all([match.save()]);
}