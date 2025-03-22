const {
    EmbedBuilder,
    PermissionFlagsBits,
    Colors,
    SlashCommandBuilder
} = require("discord.js");
const Bet = require("../structures/database/match");
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
            subcommand.setName("apagar")
                .setDescription("Base de dados aposta")
                .addStringOption(option =>
                    option.setName("escolha")
                        .setDescription("Qual você ira apagar?")
                        .addChoices({ name: "apostas", value: "bet" }, { name: "ranking", value: "users" },)
                        .setRequired(true)
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async betHandler(interaction) {
        const bet_id = interaction.options.getString("bet_id");

        if (!mongoose.Types.ObjectId.isValid(bet_id)) return interaction.reply({ content: "# Id não valido.", flags: 64 });
        const foundBet = await Bet.findOne({ _id: bet_id });
        if (!foundBet) return this.sendTemporaryMessage(interaction, "# Esta aposta não existe!");

        const winner = foundBet.winner ? `<@${foundBet.winner}>` : "Não há vencedor definido...";
        const color =  { };
        const embed = new EmbedBuilder()
            .setDescription(`# Aposta ${foundBet._id}`)
            .addFields(
                { name: "Estado", value: foundBet.status ?? "Desconhecido", inline: true },
                { name: "Tipo", value: foundBet.betType ?? "Desconhecido", inline: true },
                { name: "Dinheiro ganho", value: `${foundBet.amount}€`, inline: true },
                { name: "Jogadores", value: foundBet.players?.length ? foundBet.players.map(player => `<@${player.id}>`).join(", ") : "Nenhum", inline: true },
                { name: "Ganhador", value: winner ?? "Nenhum", inline: true },
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
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: "# Você não tem permissões.", flags: 64 });


        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case "bet":
                    this.betHandler(interaction);
                    break;
                case "user":
                    this.userHandler(interaction);
                    break;
                case "apagar":
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
            interaction.deferReply();
            const bets = await Bet.find({});

            await Promise.all(bets.map(bet => bet.deleteOne()));

            interaction.followUp({ content: "# Apaguei todas APOSTAS!" });
        } else if (choice == "users") {
            interaction.deferReply();
            const users = await User.find({});

            await Promise.all(
                users.forEach(async user => {
                    user.wins = 0;
                    user.losses = 0;
                    user.betsPlayed = [];
                    user.moneyLost = 0;
                    user.credit = 0;

                    await user.save();
                }));

            interaction.followUp({ content: "# Resetei as estatisticas para os usuarios." })

        }
    }
};