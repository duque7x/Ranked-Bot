const Bet = require("../../structures/database/bet");
const sendReply = require("../_functions/sendReply");
const Config = require('../../structures/database/configs');
const { SlashCommandBuilder, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = async function enterBet_handler(interaction ) {
    const serverConfig = await Config.findOneAndUpdate(
        { "guild.id": interaction.guild.id },  // Find the document by guild ID
        { $setOnInsert: { guild: { name: interaction.guild.name, id: interaction.guild.id } } },  // Only set this if the document doesn't exist
        { new: true, upsert: true }  // Return the updated document, and create one if it doesn't exist
    );
    const logChannel = interaction.guild.channels.cache.get("1340360434414522389") ?? interaction.channel;
    await interaction.deferUpdate({ flags: 64 });
    let [action, betType, betId, amount] = interaction.customId.split("-");
    const userId = interaction.user.id;

    let [activeBets, bet] = await Promise.all([
        Bet.find({ players: userId }), // Returns an array
        Bet.findOne({ "_id": betId })
    ]);

    // Find active bets (not "off")
    let ongoingBets = activeBets.filter(b => b.status !== "off").sort((a, b) => b.createdAt - a.createdAt);;

    // If the user has an active bet, prevent them from joining another
    if (ongoingBets.length > 0 && userId !== "877598927149490186") {
        let msg = [];
        const n = ongoingBets.forEach(bet => msg.push(bet._id));

        return sendReply(interaction, `# Você já está em outra aposta! <#${ongoingBets[0].betChannel?.id || ""}>\n-# Id da aposta(s): ${ongoingBets.length > 1 ? msg.join(", ") : ongoingBets[0]._id}\n-# Chame um ADM se esta tendo problemas.`);
    }

    if (!bet) return sendReply(interaction, errorMessages.bet_off);
    if (serverConfig.state.bets.status === "off") return interaction.followUp({ embeds: [Embeds.betsOff], flags: 64 });
    if (serverConfig.blacklist.some(id => id.startsWith(userId))) return sendReply(interaction, errorMessages.blacklist);
    if (bet.players.includes(userId)) return sendReply(interaction, `# Você já está na aposta!\n-# Id da aposta(s): ${bet._id}\n-# Chame um ADM se esta tendo problemas.`);


    if (bet.players.length >= 2) return sendReply(interaction, errorMessages.bet_full);

    bet.players.push(userId);
    await bet.save();

    const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
        .setColor(Colors.White)
        .setFields([
            { name: "Equipe 1", value: bet.players[0] ? `<@${bet.players[0]}>` : "Slot vazio", inline: true },
            { name: "Equipe 2", value: bet.players[1] ? `<@${bet.players[1]}>` : "Slot vazio", inline: true }
        ]);

    await interaction.message.edit({ embeds: [updatedEmbed] });

    await logChannel.send({
        embeds: [
            new EmbedBuilder()
                .setDescription(`# O jogador <@${userId}> entrou na fila de ${betType}\n-# Id da aposta: ${betId}.`)
                .setColor(Colors.Aqua)
                .setTimestamp()
        ]
    });

    return;
}