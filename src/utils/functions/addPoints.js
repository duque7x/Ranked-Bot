const User = require("../../structures/database/User");

module.exports = async (userId, amount) => {
    const userProfile = await User.findOrCreate(userId);
    userProfile.points = userProfile.points + amount;
    return await userProfile.save();
}