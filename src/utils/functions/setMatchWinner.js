const User = require("../../structures/database/User");
const Config = require("../../structures/database/configs");
const addPoints = require("./addPoints");
const addWin = require("./addWin");
const addGamePlayed = require("./addGamePlayed");
const BotClient = require("../..");

/**
 * 
 * @param {Match} match 
 * @param {*} winners 
 * @param {string} guildId 
 * @param {BotClient} client 
 * @returns 
 */
module.exports = async (match, winners, guildId, client) => {
  const config = await Config.findOne({ "guild.id": guildId });

  const userSavePromises = winners.map(async (user) => {
    const userProfile = client.api.users.cache.get(user.id);

    const hasValidProtection = userProfile.protections?.some(
      (p) => p.type === "double_points" && p.longevity !== 0
    );

    await userProfile.increment("gamesPlayed", match._id);
    await userProfile.increment("points", hasValidProtection ? config.points.win * 2 : config.points.win);
    await userProfile.increment("wins", 1);
  });

  match.winnerTeam = winners;
  await Promise.all([...userSavePromises, match.save()]);
  return { match, winners };
};
