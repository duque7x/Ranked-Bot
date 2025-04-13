const User = require("../../structures/database/User");

module.exports = async (userId, amount) => {
    const userProfile = await User.findOrCreate(userId);
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    userProfile.points = userProfile.points + amount;

    const dailyIndex = userProfile.dailyPoints.findIndex(entry => entry.date === today);
    if (dailyIndex >= 0) {
        userProfile.dailyPoints[dailyIndex].points += amount;
    } else {
        userProfile.dailyPoints.push({ date: today, points: amount });
    }
    return await userProfile.save();
}