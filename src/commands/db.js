const { 
    EmbedBuilder, 
    PermissionFlagsBits, 
    Colors, 
    SlashCommandBuilder 
} = require("discord.js");
const Bet = require("../structures/database/bet");
const User = require("../structures/database/User");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("db")
        .setDescription("Este comando retorna as informações de uma aposta!"),

    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const args = interaction.options.getString('args')?.split(' '); // Get args from slash command
        const [bet, id, reset] = args;

        try {
            if (reset === "reset" && !bet) {
                await Promise.all([Bet.deleteMany({}), User.deleteMany({})]);
                return interaction.reply("`Dados do banco de dados resetados com sucesso!`");
            }

            if (bet === "bet") {
                if (id === "reset") {
                    await Bet.updateMany({}, { $set: { players: [] } });
                    return interaction.reply("`Todos os jogadores foram removidos de suas apostas.`");
                }

                if (id) {
                    const foundBet = await Bet.findOne({ _id: id });
                    if (!foundBet) return this.sendTemporaryMessage(interaction, "# Esta aposta não existe!");

                    const winner = foundBet.winner ? `<@${foundBet.winner}>` : "Não há vencedor definido...";
                    const embed = new EmbedBuilder()
                        .setColor(Colors.DarkButNotBlack)
                        .setDescription(`# Aposta ${foundBet._id}`)
                        .addFields({
                            name: "Detalhes",
                            value: `**Estado:** ${foundBet.status}\n\n` +
                                `**Jogadores:** ${foundBet.players?.length ? foundBet.players.join(", ") : "Nenhum"}\n\n` +
                                `**Ganhador:** ${winner}\n\n` +
                                `**Dinheiro ganho:** ${foundBet.amount}€\n\n` +
                                `**Canal:** <#${foundBet.betChannel?.id || "Desconhecido"}>`
                        });

                    return interaction.reply({ embeds: [embed] });
                }
            }

            if (bet === "rank") {
                const allUsers = await User.find({});
                if (allUsers.length === 0) return interaction.reply("Não há apostas no banco de dados!");

                const embed = new EmbedBuilder()
                    .setColor(Colors.DarkButNotBlack)
                    .setTitle("Apostas no Banco de Dados")
                    .setDescription("Aqui estão todas as apostas registradas:");

                allUsers.forEach(user => {
                    embed.addFields({
                        name: `Jogador ${user.player.name}`,
                        value: `**Créditos**: ${user.credit}\n${user.isAdmin ? "**Adm**: Sim\n**Pontos de ADM**: " + user.adminPoints : "**Adm**: Não"}`
                    });
                });

                return interaction.reply({ embeds: [embed] });
            }

            const allBets = await Bet.find({});
            if (allBets.length === 0) return interaction.reply("Não há apostas no banco de dados!");

            const embed = new EmbedBuilder()
                .setColor(Colors.DarkButNotBlack)
                .setTitle("Apostas no Banco de Dados")
                .setDescription("Aqui estão todas as apostas registradas:");

            allBets.forEach((bet, index) => {
                embed.addFields({
                    name: `Aposta ${index + 1}`,
                    value: `**ID:** ${bet._id}\n**Jogadores:** ${bet.players?.length ? bet.players.join(", ") : "Nenhum"}\n**Canal:** <#${bet.betChannel?.id || "Desconhecido"}>\n**Estado:** ${bet.status}`
                });
            });

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            interaction.reply("Tem muitas apostas para mandar nesse momento!");
            console.error("Erro:", error);
        }
    },

    /**
     * Sends a temporary message that deletes itself after 3 seconds.
     * @param {Message} msg 
     * @param {string} content 
     */
    sendTemporaryMessage(interaction, content) {
        interaction.reply({ content, flags: 64 }).then(mg => {
            setTimeout(() => mg.delete().catch(() => { }), 3000);
        });
    }
    
};
