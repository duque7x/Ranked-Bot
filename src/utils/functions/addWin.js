const User = require("../../structures/database/User");

module.exports = async (userId) => {
    // Atualiza ou cria o usuário no banco de dados
    const userProfile = await User.findOneAndUpdate(
        { "player.id": userId },
        {
            $inc: { wins: +1 },
        },
        { new: true, upsert: true }
    );
    return userProfile;
}