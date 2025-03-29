const Match = require("../../structures/database/match");
const sendReply = require("../functions/sendReply");
const setMatchWinner = require("../functions/setMatchWinner");
const setMatchLosers = require("../functions/setMatchLosers");
const { EmbedBuilder, Colors } = require("discord.js");
const errorMessages = require("../utils").errorMessages;

module.exports = async function btnWinner(interaction) {
    const { customId, guild, channel } = interaction;
    const [action, matchId, winningTeam, losingTeam] = customId.split("-");

    // Buscar partida no banco de dados
    const match = await Match.findOne({ _id: matchId });
    if (!match) return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setTitle("Partida offline")
                .setDescription("Esta partida não se encontra na base de dados")
                .setColor(0xff0000)
                .setTimestamp()
        ],
        flags: 64
    });
    
    // Verificar se a partida já tem um vencedor
    if (match.winnerTeam.length !== 0) return sendReply(interaction, errorMessages.bet_won + `\nId: **${matchId}**`);

    await setMatchWinner(match, match[winningTeam]);
    await setMatchLosers(match, match[losingTeam]);

    const winnerEmbed = new EmbedBuilder()
        .setTitle("Ganhador(es) da partida")
        .setDescription(`Vitória adicionada ao **time ${winningTeam.split("team")[1] == "A" ? 1 : 2}**!`)
        .setColor(0x00ff00)
        .setTimestamp();


    // Responder a interação corretamente
    if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [winnerEmbed] }).catch(console.error);
    } else {
        await interaction.reply({ embeds: [winnerEmbed] }).catch(console.error);
    }
};
