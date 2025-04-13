const User = require("../../structures/database/User");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

module.exports = async (interaction, option) => {
    await interaction.guild.members.fetch();

    const users = await User.find().sort({ points: -1 });
    const perPage = 10;
    //let page = 0;

    if (users.length == 0) {
        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setTitle("Sem usuarios registrados!")
                .setTimestamp()
                .setDescription("Nenhum usuário deste servidor está registado")
                .setFooter({
                    text: "Chame um ADM para o ajudar!"
                })
                .setColor(0xff0000)
            ]
        });
    }

    const userRankPosition = users.findIndex(u => u.player.id === interaction.member.user.id) + 1;
    const firstRankedId = users[0].player.id;
    const firstRanked = interaction.guild.members.cache.has(firstRankedId) ? interaction.guild.members.cache.get(firstRankedId) : interaction.guild.members.cache.get("1355544935662883100");

    const generateEmbed = async (page = 0) => {
        if (page <= -1) page = 0;
        
        const start = page * perPage;
        const paginatedUsers = users.slice(start, start + perPage);
        const returnedUser = await require("./returnUserRank")(interaction.member.user, interaction);

        const userStats = {
            "Pontos": returnedUser.foundUser.points ?? 0,
            "Position": userRankPosition > 0 ? `${userRankPosition}` : "Não classificado"
        };

        return new EmbedBuilder()
            .setThumbnail(firstRanked?.user?.displayAvatarURL())
            .setTitle("Ranking de Pontos")
            .setDescription(
                paginatedUsers.map((user, index) => `**${start + index + 1}° -** <@${user.player.id}>: ${user.points ?? 0} pontos`
                ).join("\n") +
                `\n\n**Suas estatísticas:**\n**Pontos**: ${userStats.Pontos}\n**Posição**: ${userStats.Position}`
            )
            .setFooter({ text: `Página ${page + 1}` })
    };

    const row = (page = 0) => new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`prev-${page}`)
            .setLabel("Voltar")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 0),
        new ButtonBuilder()
            .setCustomId(`update_rank-${page}`)
            .setLabel("⟳")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId(`next-${page}`)
            .setLabel("Próxima")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled((page + 1) * perPage >= users.length)
    );

    if (option == "send") {
        await interaction.reply({
            embeds: [await generateEmbed(0)],
            components: [row(0)],
        });
    }

    return { embed: generateEmbed, row };
}