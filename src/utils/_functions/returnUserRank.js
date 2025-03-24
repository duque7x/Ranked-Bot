const User = require("../../structures/database/User");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, Colors } = require("discord.js");
const verifyChannel = require("./verifyChannel");
module.exports = async (user, interaction, option) => {
    if (!user) return "Nao existe."

    const foundUser = await User.findOneAndUpdate(
        { "player.id": user.id },
        {
            $setOnInsert: {
                player: {
                    id: user.id,
                    name: user.username
                }
            }
        },
        { upsert: true, new: true }
    );

    // Build the embed for user profile
    const embed = new EmbedBuilder()
        .setTitle("Estatísticas")
        .setColor(Colors.White)
        .addFields(
            {
                name: "Pontos",
                value: `${foundUser.points}`,
                inline: true
            },
            {
                name: "Vezes jogadas",
                value: `${foundUser.gamesPlayed.length}`,
                inline: true
            },
            {
                name: "Vitórias",
                value: `${foundUser.wins}`,
                inline: true
            },
            {
                name: "Derrotas",
                value: `${foundUser.losses}`,
                inline: true
            },
            {
                name: "Blacklist",
                value: `${foundUser.blacklisted ? "Sim" : "Não"}`,
                inline: true
            },
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512, format: 'png' }));

    // Conditional reply or log the embed based on the option
    if (option === "send") {
        return interaction.reply({ embeds: [embed], flags: 64 });
    }

    return { foundUser, embed };
}