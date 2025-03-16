const User = require("../../structures/database/User");

module.exports = async (userId, amount, isAdmin) => {
    return await User.findOneAndUpdate(
        { "player.id": userId },
        {
            $inc: { credit: amount },
            $set: { isAdmin }
        },
        { new: true, upsert: true }
    );
}