const User = require("../../structures/database/User");

module.exports = async (userId, id) => {
  const userProfile = await User.findOrCreate(userId);

  if (!userProfile.gamesPlayed.includes(id)) return userProfile;

  userProfile.gamesPlayed = userProfile.gamesPlayed.filter(p => p !== id);
  await userProfile.save();

  return userProfile;
};
