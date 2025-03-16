const User = require("../../structures/database/User");

module.exports = async (user) => {
    const userId = user.id;

    return await User.findOneAndUpdate(
        { "player.id": userId, losses: { $gt: 0 } },
        {
            $inc: { losses: -1 }
        },
        { upsert: true, new: true }
    );

}