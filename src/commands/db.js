const {
    EmbedBuilder,
    PermissionFlagsBits,
    Colors,
    SlashCommandBuilder
} = require("discord.js");
const Match = require("../structures/database/match");
const User = require("../structures/database/User");
const { returnUserRank } = require("../utils/utils");
const mongoose = require('mongoose');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("db")
        .setDescription("Este comando retorna as informações de uma partida!")
        .addSubcommand(subcommand =>
            subcommand.setName("match")
                .setDescription("Base de dados partida")
                .addStringOption(option =>
                    option.setName("match_id")
                        .setDescription("Id da partida")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("user")
                .setDescription("Base de dados: partida")
                .addUserOption(option =>
                    option.setName("usuario")
                        .setDescription("Quem você querer ver?")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("apagar")
                .setDescription("Base de dados: partida")
                .addStringOption(option =>
                    option.setName("escolha")
                        .setDescription("Qual você ira apagar?")
                        .addChoices({ name: "partidas", value: "match" }, { name: "ranking", value: "users" },)
                        .setRequired(true)
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async matchHandler(interaction) {
        const match_id = interaction.options.getString("match_id");

        if (!mongoose.Types.ObjectId.isValid(match_id)) return interaction.reply({ content: "# Id não valido.", flags: 64 });
        const foundmatch = await Match.findOne({ _id: match_id });
        if (!foundmatch) return this.sendTemporaryMessage(interaction, "# Esta partida não existe!");

        const winners = foundmatch.winnerTeam.length ? foundmatch.winnerTeam.map(user => `<@${user.id}>`).join(", ") : "Não há vencedor definido";

        const embed = new EmbedBuilder()
            .setDescription(`# Partida ${foundmatch._id}`)
            .addFields(
                { name: "Estado", value: foundmatch.status ?? "Desconhecido", inline: true },
                { name: "Tipo", value: foundmatch.matchType ?? "Desconhecido", inline: true },
                { name: "Jogadores", value: foundmatch.players?.length ? foundmatch.players.map(player => `<@${player.id}>`).join(", ") : "Nenhum", inline: true },
                { name: "Ganhador(es)", value: winners, inline: true },
                { name: "Criador", value: `<@${foundmatch.creatorId}>`, inline: true },
                { name: "Criador da sala(no jogo)", value: `<@${foundmatch.roomCreator.id}>`, inline: true },
                { name: "Canal", value: foundmatch.matchChannel?.id ? `<#${foundmatch.matchChannel.id}>` : "Desconhecido", inline: true },
                { name: "Criada em", value: foundmatch.createdAt ? new Date(foundmatch.createdAt).toLocaleString() : "Desconhecido", inline: true }
            )
            .setColor(Colors.DarkerGrey);
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
                case "match":
                    this.matchHandler(interaction);
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
            interaction.reply({ content: "# Tem muitas partidas para mandar nesse momento!", flags: 64 });
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

        if (choice == "match") {
            await interaction.deferReply();
            const matchs = await Match.find({});

            await Promise.all(matchs.map(match => match.deleteOne()));

            interaction.followUp({ content: "# Apaguei todas partidaS!" });
        } else if (choice == "users") {
            await interaction.deferReply();

            const users = await User.find({});


            users.forEach(async user => {
                user.wins = 0;
                user.losses = 0;
                user.gamesPlayed = [];
                user.points = 0;

                await user.save();
            });

            interaction.followUp({ content: "# Resetei as estatisticas para os usuarios." })

        }
    }
};