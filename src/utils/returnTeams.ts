type Player = {
    id: string;
    name: string;
}

export default function returnTeams(teams: Player[], maximumSize: number) {
    const teamSize = maximumSize / 2;

    const teamOne = teams.slice(0, teamSize);
    const teamTwo = teams.slice(teamSize, maximumSize);

    while (teamOne.length < teamSize) teamOne.push(null);
    while (teamTwo.length < teamSize) teamTwo.push(null);

    return [
        {
            name: `Equipa 1`,
            value: teamOne.map(p => p
                ? `<:off:1387492603913703540> <@${p.id}>`
                : `<:on:1387492614529355999> Lugar vazio`
            ).join("\n"),
            inline: true
        },
        {
            name: `Equipa 2`,
            value: teamTwo.map(p => p
                ? `<:off:1387492603913703540> <@${p.id}>`
                : `<:on:1387492614529355999> Lugar Vazio`
            ).join("\n"),
            inline: true
        }
    ]
}