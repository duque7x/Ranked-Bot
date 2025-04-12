const User = require("../../structures/database/User");

module.exports = async (userId, amount = 1) => {
    const userProfile = await User.findOrCreate(userId);
    userProfile.mvps = userProfile.mvps + amount;
    return await userProfile.save();
}