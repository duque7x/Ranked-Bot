const { EmbedBuilder } = require("discord.js");
const ColorThief = require("colorthief");
const { request } = require('undici');
    
function color(rgb) {
    return `#${rgb.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

async function getAvatarData(avatarUrl) {
    const [response, dominantColor] = await Promise.all([
        // Fetch the image buffer using Undici
        (async () => {
            const { body } = await request(avatarUrl);
            const data = await body.arrayBuffer(); // Convert to ArrayBuffer
            return data;
        })(),

        // Get the dominant color using the same avatarUrl
        (async () => {
            const { body } = await request(avatarUrl);
            const data = await body.arrayBuffer(); // Convert to ArrayBuffer
            return ColorThief.getColor(Buffer.from(data)); // Buffer is required for ColorThief
        })()
    ]);

    return dominantColor;
}

module.exports = async (data, user) => {
    const avatarUrl = user.displayAvatarURL({ format: "png", size: 1024 });
    const dominantColor = await getAvatarData(avatarUrl);
    const hexColor = color(dominantColor);

    const embed = new EmbedBuilder()
        .setAuthor({ name: `Perfil de ${user.username}`, iconURL: user.displayAvatarURL() })
        .setColor(hexColor)
        //.setTitle(`Estatísticas de ${user.username}`)
        .addFields(
            {
                name: "Pontos",
                value: `${data.points}`,
                inline: true,
            },
            {
                name: "MVPs",
                value: `${data.mvps}`,
                inline: true,
            },
            {
                name: "Vitórias",
                value: `${data.wins}`,
                inline: true,
            },
            {
                name: "Derrotas",
                value: `${data.losses}`,
                inline: true,
            },
            {
                name: "Vezes jogadas",
                value: `${data.gamesPlayed ?
                        data.gamesPlayed.length :
                        0
                    }`,
                inline: true,
            },
            {
                name: "Advertências",
                value: `${data.adverts && data.adverts.length ? data.adverts.length : 0}`,
                inline: true,
            },
            {
                name: "Blacklist",
                value: `${data.blacklisted ? "Sim" : "Não"}`,
                inline: true,
            }
        )
        .setThumbnail(
            user.displayAvatarURL({ dynamic: true, size: 512, format: "png" })
        );
    return embed;
}
