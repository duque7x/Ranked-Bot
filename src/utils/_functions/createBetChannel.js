const Match = require("../../structures/database/match");
const myColours = require("../../structures/colours");
const { PermissionFlagsBits, EmbedBuilder, ChannelType, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const formatTeam = require("./formatTeam");

module.exports = async (interaction, match) => {
    const { guild } = interaction;
    const totalMatches = await Match.countDocuments();
    const formattedTotalMatches = String(totalMatches).padStart(3, '0');
    const { matchType } = match;
    const [teamSize] = matchType.includes("x") ? matchType.split("x").map(Number) : matchType.split("v").map(Number);

    const matchChannel = await guild.channels.create({
        name: `partida・${formattedTotalMatches}`,
        type: ChannelType.GuildText,
        topic: match._id.toString(),
        parent: "1338988719914618892",
        permissionOverwrites: [
            {
                id: guild.roles.everyone.id,
                deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
            },
            {
                id: match.players[0].id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
            },
            {
                id: match.players[1].id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
            },
        ]
    });

    // 🔹 Shuffle and assign teams
    const { teamA, teamB } = randomizeTeams(match.players);
    match.matchChannel = { id: matchChannel.id, name: matchChannel.name };
    match.teamA = teamA;
    match.teamB = teamB;
    await match.save(); // 🔹 Ensure match is saved after team assignment

    interaction.message.edit({
        embeds: [new EmbedBuilder()
            .setTitle(`Partida ${matchType} criada com sucesso!`)
            .setDescription(`Vá ao [canal](https://discord.com/channels/1336809872884371587/${matchChannel.id}) da partida e divirta-se!`)
            .setTimestamp()
        ],
        components: []
    });

    // Embed for the match channel
    const embedForChannel = new EmbedBuilder()
        .setColor(Colors.White)
        .setDescription(`# Partida ${match.matchType}\nCriem a sala e de seguida definam o criador!`)
        .addFields([
            { name: "Time 1", value: formatTeam(teamA, teamA.length), inline: true },
            { name: "Time 2", value: formatTeam(teamB, teamB.length), inline: true }
        ])
        .setTimestamp();

    // Buttons
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`set_winner-${match._id}`).setLabel("Definir ganhador").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`end_match-${match._id}`).setLabel("Encerrar partida").setStyle(ButtonStyle.Danger)
    );

    await matchChannel.send({
        embeds: [embedForChannel],
        components: [row]
    });

    return matchChannel;
};

// 🔹 Helper function to shuffle teams
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

// 🔹 Function to randomize teams
function randomizeTeams(players) {
    let shuffledPlayers = shuffleArray([...players]); // Clone and shuffle players
    let half = Math.ceil(shuffledPlayers.length / 2);
    return { teamA: shuffledPlayers.slice(0, half), teamB: shuffledPlayers.slice(half) };
}
