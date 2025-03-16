const Bet = require("../../structures/database/bet");
const removeItemOnce = require("../_functions/removeItemOnce");
const returnErrorToMember = require("../_functions/returnErrorToMember");
const { SlashCommandBuilder, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require("discord.js");


module.exports = async function outBet_handler(interaction, betId) {
    let errorTypes = [];
    let bet = await Bet.findOne({ "_id": betId });
    const userId = interaction.user.id;
    const logChannel = interaction.guild.channels.cache.get("1340360434414522389") ?? interaction.channel;
    // Check for errors and add to errorTypes array
    if (!bet || bet.status === "off") errorTypes.push('bet_off');
    if (!bet.players?.includes(userId)) errorTypes.push('bet_not_in');

    // If there are errors, return them all in a single response
    if (errorTypes.length > 0) return returnErrorToMember(interaction, errorTypes);
    const { betType, amount } = bet;
    // Ensure bet.players is always an array
    bet.players ??= [];

    // Remove player from the bet
    bet.players = removeItemOnce(bet.players, userId);
    await bet.save();

    // Get remaining players
    const [team1, team2] = bet.players;

    // Update embed
    const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0]).setFields([
        { name: "Equipe 1", value: team1 ? `<@${team1}>` : "Slot vazio", inline: true },
        { name: "Equipe 2", value: team2 ? `<@${team2}>` : "Slot vazio", inline: true }
    ]);

    await interaction.message.edit({ embeds: [updatedEmbed] });

    // Send log message
    await logChannel.send({
        embeds: [
            new EmbedBuilder()
                .setDescription(`# O jogador <@${userId}> saiu da fila ${betType}\n-# Id da aposta: ${betId}.`)
                .setColor(Colors.Red)
                .setTimestamp()
        ]
    });

    await interaction.deferUpdate();
    return;
}