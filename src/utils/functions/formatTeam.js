module.exports = function formatTeam(team, size) {
    return Array.from({ length: size }, (_, i) => 
        team[i] ? `<:green_circle:1352978757052268585> <@${team[i].id}>` : "<:red_circle:1352978341061202061> Slot vazio"
    ).join("\n");
}
