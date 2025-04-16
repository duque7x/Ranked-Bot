const Config = require("../../structures/database/configs");
const User = require("../../structures/database/User");
const addPoints = require("./addPoints");

module.exports = async (match, guildId, userId) => {
    const config = await Config.findOne({ "guild.id": guildId });
    const userProfile = await User.findOrCreate(userId);
    const hasValidProtection = userProfile.protections.some(
        (p) => p.type === "double_points" && p.longevity !== 0
    );

    if (hasValidProtection) {
        await addPoints(userId, config.points.creator * 2);
    } else {
        await addPoints(userId, config.points.creator);
    }

    match.roomCreator = {
        id: userId,
    };

    await Promise.all([match.save()]);
}