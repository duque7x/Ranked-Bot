const User = require("../../structures/database/User");
const addLoss = require("./addLoss");
const removePoints = require("./removePoints");
const addGamePlayed = require("./addGamePlayed");
const Config = require("../../structures/database/configs");
const BotClient = require("../..");

/**
 * 
 * @param {Match} match 
 * @param {*} winners 
 * @param {string} guildId 
 * @param {BotClient} client 
 * @returns 
 */

module.exports = async (match, losers, guildId, client) => {
    const config = await Config.findOne({ "guild.id": guildId });
    match.losers = losers;

    // Create a list of promises for all users
    const promises = losers.map(async (user) => {
        const userProfile = client.api.users.cache.get(user.id);

        // Check if any protection exists and if it's still valid
        const hasValidPointProtection = userProfile.protections.some(p => p.type === "point_protect" && p.longevity !== 0);
        if (hasValidPointProtection) return;

        await userProfile.increment("gamesPlayed", match._id);
        await userProfile.decrement("points",  config.points.loss);
        await userProfile.increment("losses", 1);
    });

    // Wait for all promises to resolve
    await Promise.all(promises);
    match.save();
    return { match, losers };
}
