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
        .setDescription("Este comando retorna as informações de uma aposta!")
        .addSubcommand(subcommand =>
            subcommand.setName("bet")
                .setDescription("Base de dados aposta")
                .addStringOption(option =>
                    option.setName("bet_id")
                        .setDescription("Id da aposta")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("user")
                .setDescription("Base de dados aposta")
                .addUserOption(option =>
                    option.setName("usuario")
                        .setDescription("Quem você querer ver?")
                        .setRequired(true)
                )
        ),
    async betHandler(interaction) {
        const bet_id = interaction.options.getString("bet_id");

        const foundBet = await Bet.findOne({ _id: bet_id });
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
    },
    async userHandler(interaction) {
        const user = interaction.options.getUser("usuario");

        const foundUser = await User.findOne({ "player.id": user.id });
        if (!foundUser) return this.sendTemporaryMessage(interaction, "# Este usuario ainda não foi registrado.");

        const embed = new EmbedBuilder()
            .setColor(Colors.DarkAqua)
            .setDescription(`# ${user.username}`)
            .addFields({
                name: "Detalhes",
                value: `**Id:** ${foundUser.player.id}\n\n` +
                    `**Credito:** ${foundUser.credit !== 0 ? foundUser.credit : "Nenhum"}€\n\n` +
                    `**Blacklist:** ${foundUser.blacklisted ? "Sim" : "Não"}`
            })
            .setTimestamp()
            .setFooter({ text: "Por APOSTAS" });

        return interaction.reply({ embeds: [embed] });
    },
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case "bet":
                    this.betHandler(interaction);
                    break;
                case "user":
                    this.userHandler(interaction);
                default:
                    break;
            }
        } catch (error) {
            interaction.reply({ content: "# Tem muitas apostas para mandar nesse momento!", flags: 64 });
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

/**
 * if (args === "reset" && !args) {
                await Promise.all([Bet.deleteMany({}), User.deleteMany({})]);
                return interaction.reply("`Dados do banco de dados resetados com sucesso!`");
            }



            if (args === "rank") {
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
 */