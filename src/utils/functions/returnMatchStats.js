const { EmbedBuilder, Colors } = require("discord.js");
const Match = require("../../structures/database/match");

module.exports = (match = new Match()) => {
    const winners = match.winnerTeam.length ? match.winnerTeam.map(user => `<@${user.id}>`).join(", ") : "Não há vencedor definido";
    
    return new EmbedBuilder()
        .setDescription(`# Partida ${match.matchType}`)
        .addFields(
            { name: "Estado", value: match.status ?? "Desconhecido", inline: true },
            { name: "Tipo", value: match.matchType ?? "Desconhecido", inline: true },
            { name: "Jogadores", value: match.players?.length ? match.players.map(player => `<@${player.id}>`).join(", ") : "Nenhum", inline: true },
            { name: "Equipa 1", value: match.teamA?.length ? match.teamA.map(player => `<@${player.id}>`).join(", ") : "Nenhum", inline: true },
            { name: "Equipa 2", value: match.teamB?.length ? match.teamB.map(player => `<@${player.id}>`).join(", ") : "Nenhum", inline: true },
            { name: "Ganhador(es)", value: winners, inline: true },
            { name: "Criador", value: `<@${match.creatorId}>`, inline: true },
            { name: "Criador da sala(no jogo)", value: match.roomCreator.id ? `<@${match.roomCreator.id}>` : "Ainda não definido", inline: true },
            { name: "Canal", value: match.matchChannel?.id ? `<#${match.matchChannel.id}>` : "Desconhecido", inline: true },
            { name: "Criada em", value: match.createdAt ? new Date(match.createdAt).toLocaleString() : "Desconhecido", inline: true }
        )
        .setColor(Colors.DarkButNotBlack);
}