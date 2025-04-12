const User = require("../../structures/database/User");

module.exports = async (userId, matchId) => {    
    const userProfile = await User.findOrCreate(userId);

    if (!userProfile.gamesPlayed.includes(matchId)) {
        userProfile.gamesPlayed.push(matchId);
        await userProfile.save();
    }
    return userProfile;
};
