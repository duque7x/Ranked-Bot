const User = require("../../structures/database/User");

module.exports = async (userId, amount) => {
    const userProfile = await User.findOrCreate(userId);
    userProfile.points = userProfile.points - amount;
    userProfile.points = Math.max(0, userProfile.points);
    
    return await userProfile.save();
}