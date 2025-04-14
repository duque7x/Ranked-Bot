const { EmbedBuilder, ButtonBuilder, Colors, ButtonStyle, StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const formatTeamChallenged = require("./formatTeamChallenged");

module.exports = async (interaction, match, channelToSend) => {
    const { matchType, _id, players } = match;
    const entermatchId = `challenge_match-enter_match-${_id}`;
    const outmatchId = `challenge_match-out_match-${_id}`;
    const shutMatchId = `challenge_match-shut_match-${_id}`;
    const kick_outId = `challenge_match-kick_out-${_id}`;
    const startId = `challenge_match-start-${_id}`;

    const [teamSize] = matchType.includes("x") ? matchType.split("x").map(Number) : matchType.split("v").map(Number);
    const maxSize = teamSize * 2;

    const teamA = formatTeamChallenged(players.slice(0, teamSize), teamSize);
    const teamB = formatTeamChallenged(players.slice(teamSize), teamSize);

    const embed = new EmbedBuilder()
        .setTitle(`Partida ${matchType} | Desafio`)
        .setDescription(`Decida qual time irá jogar e, logo após, inicie a partida e se divirta-se.`)
        .addFields([
            { name: "Equipe 1", value: teamA, inline: true },
            { name: "Equipe 2", value: teamB, inline: true }
        ])
        .setColor(0x82E0FF);

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`challenge_match-${match.id}`)
        .setOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel("Entrar na equipa 1")
                .setValue(entermatchId + `-teamA`),
            new StringSelectMenuOptionBuilder()
                .setLabel("Entrar na equipa 2")
                .setValue(entermatchId + `-teamB`),
            new StringSelectMenuOptionBuilder()
                .setLabel("Sair da partida")
                .setDescription(`Selecione esta opção se quiser sair da partida`)
                .setValue(outmatchId),
            new StringSelectMenuOptionBuilder()
                .setLabel("Iniciar da partida")
                .setDescription(`Selecione esta opção para iniciar esta partida`)
                .setValue(startId),
            new StringSelectMenuOptionBuilder()
                .setLabel("Expulsar jogador")
                .setValue(kick_outId)
                .setDescription("(Somente o criador da fila) pode expulsar um jogador"),
            new StringSelectMenuOptionBuilder()
                .setLabel("Encerrar partida")
                .setDescription("(Somente o criador da fila) pode encerrá-la")
                .setValue(shutMatchId)
        )

    const row = new ActionRowBuilder().addComponents(selectMenu);

    if (channelToSend)
        await channelToSend.send({ embeds: [embed], components: [row] })

    return await interaction.reply({ embeds: [embed], components: [row] });
}

