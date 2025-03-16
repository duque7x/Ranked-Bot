const User = require("../../structures/database/User");
const { PermissionFlagsBits } = require("discord.js");

module.exports = async (userId, interaction, bet) => {
    if (!userId) return require("./sendReply")(interaction, "Membro inválido.");
    const { amount } = bet;
    // You can skip fetching the member if you don't need it elsewhere
    const isAdmin = interaction.guild.members.cache.has(userId) && interaction.guild.members.cache.get(userId).permissions.has(PermissionFlagsBits.Administrator);

    // Attempt to find and update the user profile


    return await User.findOneAndUpdate(
        { "player.id": userId },
        {
            $setOnInsert: {
                isAdmin: isAdmin,
            },
            $inc: { losses: 1, moneyLost: amount }
        },
        { upsert: true, new: true }
    );
}