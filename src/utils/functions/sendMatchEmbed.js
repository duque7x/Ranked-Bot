const { EmbedBuilder, ButtonBuilder, Colors, ButtonStyle, StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const formatTeam = require("./formatTeam");

module.exports = async (interaction, match, channelToSend) => {
    const { matchType, _id, players } = match;
    const entermatchId = `enter_match-${matchType}-${_id}`;
    const outmatchId = `out_match-${matchType}-${_id}`;
    const shutMatchId = `shut_match-${matchType}-${_id}`;
    const [teamSize] = matchType.includes("x") ? matchType.split("x").map(Number) : matchType.split("v").map(Number);
    const { teamA, teamB } = match;
    
    const embed = new EmbedBuilder()
        .setTitle(`Partida ${matchType} | Normal`)
        .setDescription(`Entre na fila e aguarde preencher para apartida começar!`)
        .addFields([
            { name: "Equipe 1", value: formatTeam(teamA, teamSize), inline: true },
            { name: "Equipe 2", value: formatTeam(teamB, teamSize), inline: true }
        ])
        .setColor(Colors.White);

    const enterMatch = new ButtonBuilder()
        .setCustomId(entermatchId)
        .setLabel("Entrar na Partida")
        .setStyle(ButtonStyle.Success);

    const outMatch = new ButtonBuilder()
        .setCustomId(outmatchId)
        .setLabel("Sair da Partida")
        .setStyle(ButtonStyle.Danger);

    const shutMatch = new ButtonBuilder()
        .setCustomId(shutMatchId)
        .setLabel("Encerrar partida")
        .setStyle(ButtonStyle.Secondary);

    const row1 = new ActionRowBuilder().addComponents(enterMatch, outMatch, shutMatch);

    channelToSend ? await channelToSend.send({ embeds: [embed], components: [row1] }) : await interaction.reply({ embeds: [embed], components: [row1] });
    return;
}

