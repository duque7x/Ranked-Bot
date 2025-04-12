const User = require("../../structures/database/User");
const addLoss = require("./addLoss");
const removePoints = require("./removePoints");
const addGamePlayed = require("./addGamePlayed");
const Config = require("../../structures/database/configs");


module.exports = async (match, losers, guildId) => {
    const config = await Config.findOne({ "guild.id": guildId });
    match.losers = losers;
    await match.save();
    

    // Create a list of promises for all users
    const promises = losers.map(async (user) => {
        const userProfile = await User.findOrCreate(user.id);

        // Check if any protection exists and if it's still valid
        const hasValidPointProtection = userProfile.protections.some(p => p.type === "point_protect" && p.longevity !== 0);
        const hasValidImunnityProtection = userProfile.protections.some(p => p.type === "immunity" && p.longevity !== 0);

        if (hasValidImunnityProtection) return;

        if (!hasValidPointProtection) await removePoints(user.id, config.points.loss)

        await addLoss(user.id);
        // Add game played even if protections exist
        await addGamePlayed(user.id, match._id);

        // Save the user profile if any updates have occurred
        await userProfile.save();
    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    return { match, losers };
}
