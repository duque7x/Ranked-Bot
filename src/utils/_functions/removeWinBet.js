const { EmbedBuilder, Colors } = require("discord.js");

module.exports = async (userId, bet, interaction) => {
    const user = interaction.guild.members.cache.get(userId);
    const { amount, _id, betChannel } = bet;

    // Create the main embed message
    const embed = new EmbedBuilder()
        .setDescription(`# Gerenciador de crédito\nCrédito de **${amount}€** foi removido de <@${userId}>!\nAposta **resetada**!`)
        .setColor(Colors.DarkRed)
        .setTimestamp();

    // Create the log embed
    const logEmbed = EmbedBuilder.from(embed)
        .addFields(
            { name: "ID da aposta:", value: _id?.toString() || "ID inválido" },
            { name: "Valor removido", value: isNaN(amount) ? "Valor inválido" : `${amount}€` },
            { name: "Canal da aposta", value: `<#${betChannel.id}>` }
        )
        .setFooter({ text: `Por ${interaction.user.username}` });

    // Log channel ID (use a constant to avoid magic numbers)
    const WIN_LOG_CHANNEL_ID = "1339329876662030346";
    const winLogChannel = interaction.guild.channels.cache.get(WIN_LOG_CHANNEL_ID) ?? interaction.channel;

    await (require("./removeCredit"))(userId, amount);
    await (require("./removeWin"))(userId, amount);


    // Reset bet data
    bet.status = "started";
    bet.winner = "";
    await bet.save();

    // Send log embed to the win log channel
    winLogChannel.send({ embeds: [logEmbed] });

    return { embed, logEmbed };
}