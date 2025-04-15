const User = require("../../structures/database/User");

module.exports = async (userId, amount) => {
  amount = amount ?? 1;

    const userProfile = await User.findOrCreate(userId);
    userProfile.points = Math.max(0, userProfile.points - amount);

    return await userProfile.save();
}