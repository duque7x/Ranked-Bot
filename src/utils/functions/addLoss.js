const User = require("../../structures/database/User");

module.exports = async (userId, amount = 1) => {
  const userProfile = await User.findOrCreate(userId);

  userProfile.losses = userProfile.losses + amount;
  return await userProfile.save();
};
