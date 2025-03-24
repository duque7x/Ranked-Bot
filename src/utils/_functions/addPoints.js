const User = require("../../structures/database/User");

module.exports = async (userId, amount) => {
    return await User.findOneAndUpdate(
        { "player.id": userId },
        {
            $inc: { points: +amount },
        },
        { new: true, upsert: true }
    );
}