const User = require("../../structures/database/User");

module.exports = async (userId) => {
    return await User.findOneAndUpdate(
        { "player.id": userId },
        {
            $inc: { mvps: -1 }
        },
        { upsert: true, new: true }
    );
}