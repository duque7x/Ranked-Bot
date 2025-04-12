const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const Match = require("../structures/database/match");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("partidason")
        .setDescription("Manda uma ou varias embed com as partidas online.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const matches = await Match.find({});
        let embeds = [];

        matches.filter(match => match.status === "created" || match.status === "on").forEach((match, index) => {
            embeds.push(new EmbedBuilder()
                .setTitle(`Partida ${index + 1}`)
                .addFields([
                    {
                        name: "Tipo de partida:",
                        value: match.matchType && match.matchType !== "" ? match.matchType : "1v1",
                        inline: true
                    },
                    {
                        name: "Jogadores",
                        value: match.players.length > 0 ? match.players.map(player => `\n<@${player.id}>`).join("") : "Sem jogadores",
                        inline: true
                    },
                    {
                        name: "Ganhadores:",
                        value: match.winnerTeam.length > 0 ? match.winnerTeam.map(player => `\n<@${player.name}>`).join("") : "Sem ganhadores",
                        inline: true
                    },
                    {
                        name: "Canal em:",
                        value: `<#${match.matchChannel.id}>`,
                        inline: true
                    },
                    {
                        name: "Começou às:",
                        value: discordTimestamp("R", match.createdAt),
                        inline: true
                    },
                    {
                        name: "Id:",
                        value: match.id.toString(),
                        inline: true
                    },
                    {
                        name: "Criador",
                        value: `<@${match.creatorId}>`,
                        inline: true
                    }
                    ,
                    {
                        name: "Criador da sala",
                        value: `${match.roomCreator.id ? `<@${match.roomCreator.id}>`: "Não definido"}`,
                        inline: true
                    }
                ])
            );
        });

        if (embeds.length > 0) {
            await interaction.reply({ content: `# Partidas abertas:`, flags: 64 });
          
            for (let i = 0; i < embeds.length; i += 10) {
              const chunk = embeds.slice(i, i + 10);
              await interaction.followUp({ embeds: chunk });
            }
          } else {
            await interaction.reply({ content: "# Não há partidas abertas.", flags: 64 });
          }
          
    }
};

/**
 * Retorna um timestamp no formato do Discord.
 * @param {string} format Formato do timestamp (ex: "R", "f", "F").
 * @param {Date | number} date Data em milissegundos ou objeto Date.
 * @returns {string} Timestamp formatado para o Discord.
 */
function discordTimestamp(format, date) {
    return `<t:${Math.floor(new Date(date).getTime() / 1000)}:${format}>`;
}
