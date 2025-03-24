const User = require("../../structures/database/User");

module.exports = async (userId, matchId) => {
    const userProfile = await User.findOneAndUpdate(
        { "player.id": userId },
        {
            $set: { player: { id: userId } }
        },
        { upsert: true, new: true }
    );

    userProfile.gamesPlayed.push(matchId);
    userProfile.save();
}