module.exports = function formatTeam(team, size) {
    return Array.from({ length: size }, (_, i) => 
        team[i] ? `${process.env.ON_EMOJI} <@${team[i].id}>` : `${process.env.OFF_EMOJI} Slot vazio`
    ).join("\n");
}
