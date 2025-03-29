const User = require("../../structures/database/User");

module.exports = async (userId, amount) => {
    const userProfile = await User.findOneAndUpdate(
        { "player.id": userId },
        {
            $inc: { points: -amount }
        },
        { new: true, upsert: true }
    );

    userProfile.points = Math.max(0, userProfile.points);
    return await userProfile.save();
}