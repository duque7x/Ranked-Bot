const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } = require("discord.js");
const BotClient = require("..");
const User = require("../structures/database/User");

module.exports = {
    name: "rank",


    /**
     * @param {Message} message 
     * @param {string[]} args 
     * @param {BotClient} client 
     */
    async execute(message, args, client) {
        try {
            const allUsers = await User.find().sort({ wins: -1 });

            if (!allUsers.length) {
                return message.reply("❌ Não há jogadores no ranking ainda!");
            }

            let page = 0;
            const itemsPerPage = 10;
            const totalPages = Math.ceil(allUsers.length / itemsPerPage);

            const generateEmbed = (page) => {
                const start = page * itemsPerPage;
                const end = start + itemsPerPage;
                const leaderboard = allUsers
                    .slice(start, end)
                    .map((user, index) => `**${start + index + 1}.** <@${user.player.id}> - **${user.wins}** vitorias`)
                    .join("\n");

                return new EmbedBuilder()
                    .setTitle("🏆 **Ranking de Vitórias**")
                    .setColor(0xFFD700)
                    .setDescription(leaderboard)
                    .setFooter({ text: `Página ${page + 1} de ${totalPages}`, iconURL: message.guild.iconURL() })
                    .setTimestamp();
            };

            const prevButton = new ButtonBuilder()
                .setCustomId("prev")
                .setLabel("⬅️ Anterior")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 0);

            const nextButton = new ButtonBuilder()
                .setCustomId("next")
                .setLabel("Próximo ➡️")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === totalPages - 1);

            const row = new ActionRowBuilder().addComponents(prevButton, nextButton);

            const leaderboardMessage = await message.channel.send({ embeds: [generateEmbed(page)], components: [row] });

            const collector = leaderboardMessage.createMessageComponentCollector({ time: 60000 });

            collector.on("collect", async (interaction) => {
                if (!["prev", "next"].includes(interaction.customId)) return;
                if (interaction.user.id !== message.author.id) {
                    return interaction.reply({ content: "❌ Apenas quem usou o comando pode mudar de página!", ephemeral: true });
                }

                page = interaction.customId === "next" ? page + 1 : page - 1;

                prevButton.setDisabled(page === 0);
                nextButton.setDisabled(page === totalPages - 1);

                await interaction.update({ embeds: [generateEmbed(page)], components: [row] });
            });

            collector.on("end", () => {
                leaderboardMessage.edit({ components: [] }).catch(() => {});
            });

        } catch (error) {
            console.error("Erro ao buscar leaderboard:", error);
            message.reply("❌ Ocorreu um erro ao buscar o ranking.");
        }
    }
};
