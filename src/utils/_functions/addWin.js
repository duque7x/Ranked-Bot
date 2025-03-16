const User = require("../../structures/database/User");

module.exports = async (user, interaction) => {
    const userId = user.id;

    // Atualiza ou cria o usuário no banco de dados
    const userProfile = await User.findOneAndUpdate(
        { "player.id": userId },
        {
            $inc: { wins: 1 },
            $set: { "player.id": userId }
        },
        { new: true, upsert: true }
    );
    return userProfile;
}