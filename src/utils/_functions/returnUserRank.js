const User = require("../../structures/database/User");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, Colors } = require("discord.js");
module.exports = async (user, interaction, option) => {
    // Default to interaction.user if no user is provided
    user = user ?? interaction.member.user;

    // Get member from the guild
    const member = interaction.guild.members.cache.get(user.id);

    // Fetch or create the user profile with upsert
    const foundUser = await User.findOneAndUpdate(
        { "player.id": user.id },
        {
            $setOnInsert: {
                isAdmin: member.permissions.has(PermissionFlagsBits.Administrator),
            }
        },
        { upsert: true, new: true }
    );

    // Fetch color from avatar URL or default to white
    const color = Colors.White;

    // Build the embed for user profile
    const embed = new EmbedBuilder()
        .setAuthor({
            name: `Perfil de ${user.username}`,
            iconURL: user.displayAvatarURL({ dynamic: true, size: 512, format: 'png' }),
        })
        .setColor(color)
        .addFields({
            name: "Estatísticas",
            value: `
                **Vitórias:** ${foundUser.wins ?? 0} ︱ **Derrotas:** ${foundUser.losses ?? 0}
                **Crédito disponível:** ${foundUser.credit !== 0 ? foundUser.credit : 0}€ ︱ **Vezes jogadas:** ${foundUser.betsPlayed.length ?? 0}
                **Blacklist:** ${foundUser.blacklisted ? "Sim" : "Não"} ︱ **Dinheiro perdido:** ${foundUser.moneyLost ?? 0}€
            `,
        })
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512, format: 'png' }));

    // Conditional reply or log the embed based on the option
    if (option === "send") {
        return interaction.reply({ embeds: [embed], flags: 64 });
    }

    return { foundUser, embed };
}