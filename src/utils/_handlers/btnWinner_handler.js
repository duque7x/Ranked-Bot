const Bet = require("../../structures/database/bet");
const sendReply = require("../_functions/sendReply");
const { setBetWinner, addLossWithAmount } = require("../utils");
const { SlashCommandBuilder, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = async function btnWinner(interaction) {
    const [action, betId, winingPlayerId, losingPlayerId] = customId.split("-");

    const bet = await Bet.findOne({ _id: betId });
    if (bet.winner) return this.sendReply(interaction, errorMessages.bet_won + `\nId: **${betId}**`);
    const winningMember = interaction.guild.members.cache.get(winingPlayerId);
    const losingMember = interaction.guild.members.cache.get(losingPlayerId);

    const loserProfile = (await addLossWithAmount(losingPlayerId, interaction, bet));
    const winnerProfile = (await setBetWinner(bet, winningMember)).userProfile;

    !loserProfile.betsPlayed.includes(bet._id) ? loserProfile.betsPlayed.push(bet._id) : console.log("Added bet.");
    !winnerProfile.betsPlayed.includes(bet._id) ? winnerProfile.betsPlayed.push(bet._id) : console.log("Added bet.");

    loserProfile.save();
    winnerProfile.save();

    const logEmbed = new EmbedBuilder()
        .setDescription(`# Gerenciador de crédito\nCrédito de **${bet.amount}€** foi adicionado a <@${userId}>!`)
        .setColor(Colors.DarkButNotBlack)
        .setTimestamp()
        .addFields(
            { name: "ID da aposta:", value: bet?._id?.toString() ?? "ID inválido" },
            { name: "Valor ganho", value: `${bet.amount}€` },
            { name: "Canal da aposta", value: bet?.betChannel?.id ? `<#${bet.betChannel.id}>` : "Canal inválido" }
        );

    const winLogChannel = interaction.guild.channels.cache.get("1339329876662030346") || interaction.channel;

    const winnerEmbed = new EmbedBuilder()
        .setDescription(`# Gerenciador de vitórias\n-# Vitória adicionada a <@${userId}>!\nAgora com **${winnerProfile.wins + 1}** vitórias`)
        .setColor(Colors.DarkButNotBlack)
        .setThumbnail(winningMember.user.displayAvatarURL({ dynamic: true, size: 512, format: 'png' }))
        .setTimestamp();


    await winLogChannel.send({ embeds: [logEmbed] });

    interaction.replied || interaction.deferred
        ? interaction.followUp({ embeds: [winnerEmbed] }).catch(console.error)
        : interaction.reply({ embeds: [winnerEmbed] }).catch(console.error);
}