const {
    EmbedBuilder,
    PermissionFlagsBits,
    Colors,
    SlashCommandBuilder
} = require("discord.js");
const Bet = require("../structures/database/bet");
const User = require("../structures/database/User");
const { returnUserRank } = require("../utils/utils");
const mongoose = require('mongoose');

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
        )
        .addSubcommand(subcommand =>
            subcommand.setName("resetar")
                .setDescription("Base de dados aposta")
                .addStringOption(option =>
                    option.setName("escolha")
                        .setDescription("Qual voce ira resetar?")
                        .addChoices({ name: "apostas", value: "bet" }, { name: "ranking", value: "users" },)
                        .setRequired(true)
                )
        ),
    async betHandler(interaction) {
        const bet_id = interaction.options.getString("bet_id");

        if (!mongoose.Types.ObjectId.isValid(bet_id)) return interaction.reply({ content: "# Id não valido.", flags: 64 });
        const foundBet = await Bet.findOne({ _id: bet_id });
        if (!foundBet) return this.sendTemporaryMessage(interaction, "# Esta aposta não existe!");
        console.log({foundBet});
        
        const winner = foundBet.winner ? `<@${foundBet.winner}>` : "Não há vencedor definido...";

        const embed = new EmbedBuilder()
            .setDescription(`# Aposta ${foundBet._id}`)
            .addFields(
                { name: "Estado", value: foundBet.status[0] || "Desconhecido", inline: true },
                { name: "Tipo", value: foundBet.betType[0] || "Desconhecido", inline: true },
                { name: "Dinheiro ganho", value: `${foundBet.amount}€`, inline: true },
                { name: "Jogadores", value: foundBet.players?.length ? foundBet.players.map(player => `<@${player}>`).join(", ") : "Nenhum", inline: true },
                { name: "Ganhador", value: winner || "Nenhum", inline: true },
                { name: "Canal", value: foundBet.betChannel?.id ? `<#${foundBet.betChannel.id}>` : "Desconhecido", inline: true },
                { name: "Criada em", value: foundBet.createdAt ? new Date(foundBet.createdAt).toLocaleString() : "Desconhecido", inline: true }
            );
        return interaction.reply({ embeds: [embed] });
    },
    async userHandler(interaction) {
        const user = interaction.options.getUser("usuario");

        const { foundUser, embed } = await returnUserRank(user, interaction);

        return interaction.reply({ embeds: [embed] });
    },
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply("# Você não tem permissões.");

        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case "bet":
                    this.betHandler(interaction);
                    break;
                case "user":
                    this.userHandler(interaction);
                    break;
                case "resetar":
                    this.resetHandlet(interaction);
                    break;
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
    },
    async resetHandlet(interaction) {
        if (interaction.user.id !== "877598927149490186") return;

        const choice = interaction.options.getString("escolha");

        if (choice == "bet") {
            const bets = await Bet.find({});

            bets.forEach(async bet => {
                // bet.deleteOne();

                bet.players = [];
                bet.winner = "";
                await bet.save();
            });

            interaction.reply({ content: "# Tirei todos jogadores das apostas, e os vencedores!" });
        } else if (choice == "users") {
            const users = await User.find({});

            users.forEach(async user => {
                user.wins = 0;
                user.losses = 0;
                user.betsPlayed = [];
                user.moneyLost = 0;
                user.credit = 0;

                await user.save();
            });

            interaction.reply({ content: "# Resetei a base de dados para os usuarios." })

        }
    }
};