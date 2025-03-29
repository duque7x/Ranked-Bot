const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, Colors } = require("discord.js");
const Config = require("../structures/database/configs");
const Bet = require("../structures/database/match");
const { setBetWinner, removeWin, removeWinBet, sendReply, errorMessages, setMatchWinner, removeWinMatch } = require("../utils/utils");
const myColours = require("../structures/colours");
const { ChatInputCommandInteraction } = require("discord.js");
const removeItemOnce = require("../utils/functions/removeItemOnce");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gerenciar")
        .setDescription("Gerencia configurações das partidas.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand.setName("partida")
                .setDescription("Gerencia partidas")
                .addStringOption(option =>
                    option.setName("match_id")
                        .setDescription("Id da partida")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("acão")
                        .setDescription("Ação a ser executada (addwin, removewin, status).")
                        .setRequired(true)
                        .addChoices(
                            { name: "Adicionar Vitória Para Time 1", value: "addwin-teamA" },
                            { name: "Adicionar Vitória Para Time 2", value: "addwin-teamB" },
                            { name: "Remover Vitória Para Time 1", value: "removewin-teamA" },
                            { name: "Remover Vitória Para Time 2", value: "removewin-teamB" },
                            { name: "Adicionar jogador", value: "add_player" },
                            { name: "Remover jogador", value: "remove_player" },
                            { name: "Alterar para off", value: "status_off" },
                            { name: "Alterar para created", value: "status_created" },
                            { name: "Alterar para on", value: "status_on" },
                            { name: "Alterar para shutted", value: "status_shutted" },
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("alterarestado")
                .setDescription("Altera configurações")
                .addStringOption(option =>
                    option.setName("opção")
                        .setDescription("Opção a ser alterada")
                        .setRequired(true)
                        .addChoices(
                            { name: "Apostas", value: "matchs" },
                            { name: "Ranking", value: "rank" }
                        )
                )
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "partida":
                return this.matchHandler(interaction);
            case "alterarestado":
                return this.configHandler(interaction);
        }
    },
    async matchHandler(interaction) {
        const action = interaction.options.getString("acão");
        const matchId = interaction.options.getString("match_id");
        const user = interaction.options.getUser("usuário") || interaction.user;
        const match = await Bet.findOne({ "_id": matchId }); // Add 'await'
        if (!match) return interaction.reply({ content: "# Aposta nao encontrada", flags: 64 });

        if (action.startsWith("addwin")) {
            const team = match[action.split("-")[1]];
            await setMatchWinner(match, team);

            const embed = new EmbedBuilder().setTitle(`Time vencedor agora é o: Time ${action.split("-")[1].replace("team", "") == "A" ? "1" : "2"}`).setColor(Colors.Aqua).setTimestamp();

            if (interaction.replied || interaction.deferred) interaction.followUp({ embeds: [embed] }).catch(console.error);
            else interaction.reply({ embeds: [embed] }).catch(console.error);
        }

        if (action.startsWith("removewin")) {
            const team = match[action.split("-")[1]];
            await removeWinMatch(team, match, interaction);

            const embed = new EmbedBuilder().setTitle("Vencedores da partida foram redefinidos").setColor(0xff0000).setTimestamp();

            if (interaction.replied || interaction.deferred) interaction.followUp({ embeds: [embed] }).catch(console.error);
            else interaction.reply({ embeds: [embed] }).catch(console.error);
        }
        if (action.startsWith("status")) {
            const wantedStatus = action.split("_")[1];

            const embed = new EmbedBuilder()
                .setColor(Colors.DarkGrey)
                .setTitle(`Mudança de estado: ${wantedStatus.toUpperCase()}`)
                .setDescription(`Estado da partida foi alterado de **${match.status}** para **${wantedStatus}**.`)
                .setTimestamp();

            match.status = wantedStatus;
            await match.save();

            interaction.reply({ embeds: [embed] });
        }
    },
    async configHandler(interaction) {
        const option = interaction.options.getString("opção");
        let serverConfig = await Config.findOne({ "guild.id": interaction.guildId });

        if (!serverConfig) {
            serverConfig = new Config({
                guild: { id: interaction.guildId, name: interaction.guild.name },
                state: { matchs: { status: "on" }, rank: { status: "on" } }
            });
            await serverConfig.save();
        }

        const status = serverConfig.state[option].status;
        const newStatus = serverConfig.state[option].status = status === "on" ? "off" : "on";
        await serverConfig.save();

        const embed = new EmbedBuilder()
            .setColor(Colors.DarkGrey)
            .setTitle(`Mudança de estado: ${option.toUpperCase()}`)
            .setDescription(`**${option}** foi alterado de **${status}** para **${newStatus}**.`)
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};
