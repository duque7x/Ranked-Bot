const User = require("../../structures/database/User");

module.exports = async (userId, amount = 1) => {
  const userProfile = await User.findOrCreate(userId);

  userProfile.wins = Math.max(0, userProfile.wins - amount);
  return await userProfile.save();
};
