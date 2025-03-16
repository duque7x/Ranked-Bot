const User = require("../../structures/database/User");

module.exports = async (user, interaction) => {
    return await User.findOneAndUpdate(
        { "player.id": user.id },
        {
            $set: {
                "player.name": user.username,
            },
            $inc: {
                wins: -1,
            },
        },
        { new: true, upsert: true } // Ensure that the user is created if not found, and return the updated user
    );
}