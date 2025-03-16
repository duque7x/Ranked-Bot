const User = require("../../structures/database/User");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

module.exports = async (interaction) => {

    await interaction.guild.members.fetch();

    const users = await User.find().sort({ wins: -1 });
    const perPage = 10;
    let page = 0;

    // Find the user's rank in the sorted array
    const userRankPosition = users.findIndex(u => u.player.id === interaction.member.user.id) + 1;
    const firstRankedId = users[0].player.id;
    const firstRanked = interaction.guild.members.cache.has(firstRankedId) ? interaction.guild.members.cache.get(firstRankedId) : interaction.guild.members.cache.get("1323068234320183407");

    const generateEmbed = async () => {
        const start = page * perPage;
        const paginatedUsers = users.slice(start, start + perPage);
        const returnedUser = await require("./returnUserRank")(interaction.member.user, interaction);

        const userStats = {
            "Vitórias": returnedUser.foundUser.wins ?? 0,
            "Posição": userRankPosition > 0 ? `${userRankPosition}` : "Não classificado"
        };

        return new EmbedBuilder()
            .setThumbnail(firstRanked?.user?.displayAvatarURL())
            .setTitle("Ranking de Vitórias")
            .setDescription(
                paginatedUsers.map((user, index) =>
                    `**${start + index + 1}° -** <@${user.player.id}>: ${user.wins ?? 0} vitórias`
                ).join("\n") +
                `\n\n**Suas estatísticas:**\n**Vitórias**: ${userStats.Vitórias}\n**Posição**: ${userStats.Posição}`
            )
            .setFooter({ text: `Página ${page + 1}` })
    };

    const row = () => new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("prev")
            .setLabel("Voltar")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0),
        new ButtonBuilder()
            .setCustomId("next")
            .setLabel("Próxima")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled((page + 1) * perPage >= users.length)
    );

    // Send the interaction with response and components
    const message = await interaction.reply({
        embeds: [await generateEmbed()], // Await to resolve the async function
        components: [row()],
        fetchReply: true,
        flags: 64
    });

    // Collector for button interactions
    const collector = message.createMessageComponentCollector({ time: 120000 });

    collector.on("collect", async (btnInteraction) => {
        if (btnInteraction.customId === "prev") page--;
        if (btnInteraction.customId === "next") page++;

        await btnInteraction.update({ embeds: [await generateEmbed()], components: [row()] });
    });

    return { embed: await generateEmbed() };
}