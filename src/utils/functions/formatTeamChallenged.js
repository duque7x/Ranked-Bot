module.exports = (team, size) => {
    return Array.from({ length: size }, (_, i) =>
        team[i] ?
            `${i == 0 || i == (size * 2 - 1) ? `Capitão <@${team[i].id}>` : `<:green_circle:1355617582454935601> <@${team[i].id}>`}` :
            `${(i == 0 || i == (size * 2 - 1)) && team[i] ? "Capitão" : ""}<:red_circle:1355617581020483823> Slot vazio`
    ).join("\n");
}
