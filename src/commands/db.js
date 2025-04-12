const {
    EmbedBuilder,
    PermissionFlagsBits,
    Colors,
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require("discord.js");
const Match = require("../structures/database/match");
const User = require("../structures/database/User");
const { returnUserRank } = require("../utils/utils");
const mongoose = require('mongoose');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("db")
        .setDescription("Este comando retorna as informações requisitadas por você")
        .addSubcommand(subcommand =>
            subcommand.setName("partida")
                .setDescription("Base de dados partida")
                .addStringOption(option =>
                    option.setName("id")
                        .setDescription("Id da partida")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("usuário")
                .setDescription("Base de dados: usuários")
                .addUserOption(option =>
                    option.setName("usuario")
                        .setDescription("Quem você querer ver?")
                        .setRequired(true)
                )
                .addBooleanOption(options =>
                    options.setName("apagar")
                        .setDescription("Selecionando true ira apagar o usuário selecionado")
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("apagar")
                .setDescription("Esta opção apagara os valores da escolha selecionada por você")
                .addStringOption(option =>
                    option.setName("escolha")
                        .setDescription("Qual você ira apagar?")
                        .addChoices({ name: "partidas", value: "match" }, { name: "ranking", value: "users" },)
                        .setRequired(true)
                )
        ).addSubcommand(subcommand =>
            subcommand.setName("resetar")
                .setDescription("Base de dados: partida")
                .addStringOption(option =>
                    option.setName("escolha")
                        .setDescription("Qual você ira apagar?")
                        .addChoices({ name: "partidas", value: "match" }, { name: "ranking", value: "users" },)
                        .setRequired(true)
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case "partida":
                    this.matchHandler(interaction);
                    break;
                case "usuário":
                    this.userHandler(interaction);
                    break;
                case "apagar":
                    this.deleteHandler(interaction);
                    break;
                case "resetar":
                    this.resetHandlet(interaction);
                    break;
                default:
                    break;
            }
        } catch (error) {
            interaction.reply({ content: "# Tem muitas partidas para mandar nesse momento!", flags: 64 });
        }
    },
    async resetHandlet(interaction) {
        const choice = interaction.options.getString("escolha");

        if (choice == "match") {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Resetando...")
                        .setColor(Colors.DarkRed)
                        .setDescription("Este procedimento realizará uma resetação de alguns dados de todas partidas! Dados: `mvp, criador da sala, advertências, ganhadores, estado da partida.`")
                        .setFooter({ text: "Pode demorar" })
                        .setTimestamp()
                ], flags: 64
            });
            await Match.updateMany(
                {}, // filter (e.g., update all users)
                {
                    $set: {
                        status: "on",
                        winnerTeam: [],
                        roomCreator: [],
                        confirmed: [],
                        mvp: [],
                        adverts: []
                    }
                }
            );
            await interaction.editReply({
                flags: 64,
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Resetado")
                        .setColor(0xff000)
                        .setDescription("Partidas resetadas com sucesso!")
                        .setTimestamp()
                        .setFooter({ text: "Por: " + interaction.user.username })
                ]
            })
        } else if (choice == "users") {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Resetando...")
                        .setColor(Colors.DarkRed)
                        .setDescription("Este procedimento realizará uma resetação de todos os dados sobre os usuários")
                        .setFooter({ text: "Pode demorar" })
                        .setTimestamp()
                ], flags: 64
            });

            await User.updateMany(
                {},
                {
                    $set: {
                        points: 0,
                        losses: 0,
                        mvps: 0,
                        protections: [],
                        originalChannels: [],
                        gamesPlayed: [],
                        wins: 0,
                    }
                }
            );

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Resetado")
                        .setColor(0xff000)
                        .setDescription("Usuários resetados com sucesso")
                        .setFooter({ text: "Por: " + interaction.user.username })
                        .setTimestamp()
                ]
            });
            const users = await User.find({});

            users.forEach(async player => {
                if (!player.player ||!player.player.id  || player.player.name == "undefined" || player.player.name == "null")
                    await player.deleteOne();
            });
        }
    },
    async matchHandler(interaction) {
        const id = interaction.options.getString("id");

        if (!mongoose.Types.ObjectId.isValid(id)) return interaction.reply({ content: "# Id não valido.", flags: 64 });
        const foundmatch = await Match.findOne({ _id: id });
        if (!foundmatch) return this.sendTemporaryMessage(interaction, "# Esta partida não existe!");

        const winners = foundmatch.winnerTeam.length ? foundmatch.winnerTeam.map(user => `<@${user.id}>`).join(", ") : "Não há vencedor definido";

        const embed = new EmbedBuilder()
            .setDescription(`# Partida ${foundmatch.matchType}`)
            .addFields(
                { name: "Estado", value: foundmatch.status ?? "Desconhecido", inline: true },
                { name: "Tipo", value: foundmatch.matchType ?? "Desconhecido", inline: true },
                { name: "Jogadores", value: foundmatch.players?.length ? foundmatch.players.map(player => `<@${player.id}>`).join(", ") : "Nenhum", inline: true },
                { name: "Equipa 1", value: foundmatch.teamA?.length ? foundmatch.teamA.map(player => `<@${player.id}>`).join(", ") : "Nenhum", inline: true },
                { name: "Equipa 2", value: foundmatch.teamB?.length ? foundmatch.teamB.map(player => `<@${player.id}>`).join(", ") : "Nenhum", inline: true },
                { name: "Ganhador(es)", value: winners, inline: true },
                { name: "Criador", value: `<@${foundmatch.creatorId}>`, inline: true },
                { name: "Criador da sala(no jogo)", value: foundmatch.roomCreator.id ? `<@${foundmatch.roomCreator.id}>` : "Ainda não definido", inline: true },
                { name: "Canal", value: foundmatch.matchChannel?.id ? `<#${foundmatch.matchChannel.id}>` : "Desconhecido", inline: true },
                { name: "Criada em", value: foundmatch.createdAt ? new Date(foundmatch.createdAt).toLocaleString() : "Desconhecido", inline: true }
            )
            .setColor(Colors.DarkerGrey);
        return interaction.reply({ embeds: [embed] });
    },
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async userHandler(interaction) {
        const user = interaction.options.getUser("usuario");
        const deleteUser = interaction.options.getBoolean("apagar");

        if (deleteUser) {
            await User.deleteOne({ "player.id": user.id });

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Usuário removido da base de dados")
                        .setDescription(`<@${user.id}> precisara **criar** ou **entrar** numa fila para ser registrado novamente.`)
                        .setColor(0xff0000)
                        .setTimestamp()
                        .setFooter({ text: `Por: ${interaction.member.displayName}` })
                ],
                flags: 64
            });
        }
        await returnUserRank(user, interaction, "send");
    },
    async deleteHandler(interaction) {
        if (interaction.user.id !== "877598927149490186") return;

        const choice = interaction.options.getString("escolha");

        if (choice == "match") {
            await interaction.deferReply();
            await Match.deleteMany({});

            return interaction.followUp({ content: "# Apaguei todas partidas!" });
        } else if (choice == "users") {
            await interaction.deferReply();
            await User.deleteMany({});
            return interaction.followUp({ content: "# Apaguei todos usuarios que estavam registrados!" })
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
};