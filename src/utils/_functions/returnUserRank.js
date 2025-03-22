const User = require("../../structures/database/User");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, Colors } = require("discord.js");
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
        .setAuthor({
            name: `Perfil de ${user.username}`,
            iconURL: user.displayAvatarURL({ dynamic: true, size: 512, format: 'png' }),
        })
        .setColor(Colors.White)
        .addFields({
            name: "Estatísticas",
            value: `
                **Pontos:** ${foundUser.points} ︱ **Vezes jogadas:** ${foundUser.gamesPlayed.length}
                **Vitórias** ${foundUser.wins} ︱ **Derrotas:** ${foundUser.losses ?? 0}
                **Blacklist:** ${foundUser.blacklisted ? "Sim" : "Não"} 
            `,
        })
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512, format: 'png' }));

    // Conditional reply or log the embed based on the option
    if (option === "send") {
        return interaction.reply({ embeds: [embed], flags: 64 });
    }

    return { foundUser, embed };
}