const User = require("../../structures/database/User");

module.exports = async (userId, amount) => {
    const userProfile = await User.findOrCreate(userId);
    userProfile.points = userProfile.points - amount;
    userProfile.points = Math.max(0, userProfile.points);
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const dailyIndex = userProfile.dailyPoints.findIndex(entry => entry.date === today);
    if (dailyIndex >= 0) {
        userProfile.dailyPoints[dailyIndex].points += amount;
    } else {
        userProfile.dailyPoints.push({ date: today, points: amount });
    }

    return await userProfile.save();
}