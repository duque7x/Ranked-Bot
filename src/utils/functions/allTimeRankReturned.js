const User = require("../../structures/database/User");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

module.exports = async (guild) => {
    const users = (await User.find({})).filter(u => u.points > 0).sort((a, b) => b.points - a.points).slice(0, 10);

    if (users.length == 0) {
        const generateEmbed = () => new EmbedBuilder()
            .setTitle("Sem usuarios registrados!")
            .setTimestamp()
            .setDescription("Nenhum usuário deste servidor está registado")
            .setFooter({
                text: "Chame um ADM para o ajudar!"
            })
            .setColor(0xff0000);

        return { generateEmbed };
    }

    const firstRankedId = users[0].player.id;
    const firstRanked = guild.members.cache.has(firstRankedId) ? guild.members.cache.get(firstRankedId) : guild.members.cache.get("1355544935662883100");
    const generateEmbed = () => {
        return new EmbedBuilder()
            .setThumbnail(firstRanked?.user?.displayAvatarURL())
            .setTitle("Ranking de Pontos")
            .setDescription(
                users.map((user, index) => `**${index + 1}° -** <@${user.player.id}>: ${user.points ?? 0} pontos`
                ).join("\n")
            )
            .setFooter({ text: "Atualizado todos dias" })
            .setTimestamp();
    };

    return { generateEmbed };
}