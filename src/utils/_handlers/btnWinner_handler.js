const Match = require("../../structures/database/match");
const sendReply = require("../_functions/sendReply");
const addLossWithAmount = require("../_functions/addLossWithAmount");
const setmatchWinner = require("../_functions/setBetWinner");
const { EmbedBuilder, Colors } = require("discord.js");
const errorMessages = require("../utils").errorMessages;

module.exports = async function btnWinner(interaction) {
    const { customId, guild, channel } = interaction;
    const [action, matchId, winningTeam, losingTeam] = customId.split("-");

    // Buscar partida no banco de dados
    const match = await Match.findOne({ _id: matchId });
    if (!match) return sendReply(interaction, "partida não encontrada.");

    // Verificar se a partida já tem um vencedor
    if (match.winner) return sendReply(interaction, errorMessages.bet_won + `\nId: **${matchId}**`);
    
    await setmatchWinner(match, match[winningTeam]);

    const winnerEmbed = new EmbedBuilder()
        .setDescription(`# Ganhador da partida!\n-# Vitória adicionada ao **time** ${winningTeam.split("team")[1] == "A" ? 1 : 2}!`)
        .setColor(0x00ff00)
        .setTimestamp();


    // Responder a interação corretamente
    if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [winnerEmbed] }).catch(console.error);
    } else {
        await interaction.reply({ embeds: [winnerEmbed] }).catch(console.error);
    }
};
