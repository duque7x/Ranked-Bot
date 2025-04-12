module.exports = function formatTeam(team, size) {
    return Array.from({ length: size }, (_, i) => 
        team[i] ? `<:green_circle:1355617582454935601> <@${team[i].id}>` : "<:red_circle:1355617581020483823> Slot vazio"
    ).join("\n");
}
