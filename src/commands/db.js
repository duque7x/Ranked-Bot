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
const returnMatchStats = require("../utils/functions/returnMatchStats");

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
                        .setColor(0xff0000)
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
                        .setColor(0xff0000)
                        .setDescription("Usuários resetados com sucesso")
                        .setFooter({ text: "Por: " + interaction.user.username })
                        .setTimestamp()
                ]
            });
            const users = await User.find({});

            users.forEach(async player => {
                if (!player.player || !player.player.id || player.player.name == "undefined" || player.player.name == "null")
                    await player.deleteOne();
            });
        }
    },
    async matchHandler(interaction) {
        const id = interaction.options.getString("id");
        if (!mongoose.Types.ObjectId.isValid(id)) return interaction.reply({ content: "# Id não valido.", flags: 64 });

        const foundmatch = await Match.findOne({ _id: id });
        if (!foundmatch) return this.sendTemporaryMessage(interaction, "# Esta partida não existe!");

        const matchEmbed = returnMatchStats(foundmatch);
        return interaction.reply({ embeds: [matchEmbed] });
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
        const choice = interaction.options.getString("escolha");

        if (choice == "match") {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Apagando...")
                        .setColor(Colors.DarkRed)
                        .setDescription("Este procedimento pode demorar alguns minutos!")
                        .setTimestamp()
                ], flags: 64
            });

            await Match.deleteMany({});

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Apagadas")
                        .setColor(0xff0000)
                        .setDescription("Partidas apagadas com sucesso.")
                        .setFooter({ text: "Por: " + interaction.user.username })
                        .setTimestamp()
                ]
            }); 
        } else if (choice == "users") {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Apagando...")
                        .setColor(Colors.DarkRed)
                        .setDescription("Este procedimento pode demorar alguns minutos!")
                        .setTimestamp()
                ], flags: 64
            });

            await User.deleteMany({})

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Apagados")
                        .setColor(0xff0000)
                        .setDescription("Usuários apagados com sucesso.")
                        .setFooter({ text: "Por: " + interaction.user.username })
                        .setTimestamp()
                ]
            }); 
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