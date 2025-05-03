module.exports = (team, size) => {
    return Array.from({ length: size }, (_, i) =>
        team[i] ?
            `${i == 0 || i == (size * 2 - 1) ? `Capitão <@${team[i].id}>` : `${process.env.ON_EMOJI} <@${team[i].id}>`}` :
            `${(i == 0 || i == (size * 2 - 1)) && team[i] ? "Capitão" : ""}${process.env.OFF_EMOJI} Slot vazio`
    ).join("\n");
}
