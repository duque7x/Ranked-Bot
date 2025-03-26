const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const Match = require("../structures/database/match");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("onmatches")
        .setDescription("Manda uma embed com as partidas online.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const matchs = await Match.find({});
        let embeds = [];

        matchs.filter(match => match.status === "created" || match.status === "on").forEach((match, index) => {
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
                ])
            );
        });

        if (embeds.length > 0) {
            interaction.reply({ embeds });
        } else {
            interaction.reply({ content: "# Não há partidas abertas.", flags: 64 });
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
