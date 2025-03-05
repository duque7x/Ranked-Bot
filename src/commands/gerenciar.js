const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const Config = require("../structures/database/configs");
const Bet = require("../structures/database/bet");
const { setBetWinner, removeWin, removeWinBet } = require("../utils/utils");
const myColours = require("../structures/colours");
const { ChatInputCommandInteraction } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gerenciar")
        .setDescription("Gerencia configurações das apostas.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand.setName("aposta")
                .setDescription("Gerencia apostas.")
                .addStringOption(option =>
                    option.setName("bet_id")
                        .setDescription("Id da aposta.")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("acão")
                        .setDescription("Ação a ser executada (addwin, removewin, status).")
                        .setRequired(true)
                        .addChoices(
                            { name: "Adicionar Vitória", value: "addwin" },
                            { name: "Remover Vitória", value: "removewin" },
                            { name: "Alterar status para on", value: "status_on" },
                            { name: "Alterar status para won", value: "status_won" },
                            { name: "Alterar status para off", value: "status_off" },
                            { name: "Alterar status para started", value: "status_started" },
                        )
                )
                .addUserOption(option =>
                    option.setName("usuário")
                        .setDescription("Usuário (caso necessário para a ação).")
                        .setRequired(false)
                )
                .addIntegerOption(option =>
                    option.setName("quantidade")
                        .setDescription("Quantidade (caso necessário para a ação).")
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("config")
                .setDescription("Altera configurações.")
                .addStringOption(option =>
                    option.setName("option")
                        .setDescription("Opção a ser alterada.")
                        .setRequired(true)
                        .addChoices(
                            { name: "Apostas", value: "bets" },
                            { name: "Ranking", value: "rank" }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("credito")
                .setDescription("Adiciona ou remove o credito do usuario")
                .addStringOption(option =>
                    option.setName("acão")
                        .setDescription("Adicionar ou remover?")
                        .setRequired(true)
                        .addChoices(
                            { name: "Adicionar", value: "add" },
                            { name: "Remover", value: "remove" }
                        )
                )
                .addUserOption(option =>
                    option.setName("usuário")
                        .setDescription("Usuário a ser adicionado/removido manipulado.")
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option.setName("quantidade")
                        .setDescription("Quantidade de dinheiro a ser adicionada ou removida.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("blacklist")
                .setDescription("Gerencia blacklist.")
                .addStringOption(option =>
                    option.setName("acão")
                        .setDescription("Ação a ser executada (add, remove).")
                        .setRequired(true)
                        .addChoices(
                            { name: "Adicionar", value: "add" },
                            { name: "Remover", value: "remove" }
                        )
                )
                .addUserOption(option =>
                    option.setName("usuário")
                        .setDescription("Usuário a ser adicionado/removido da blacklist.")
                        .setRequired(true)
                )

        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: "# Você não tem permissões.", flgas: 64 });


        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "aposta":
                return this.betHandler(interaction);
            case "config":
                return this.configHandler(interaction);
            case "blacklist":
                return this.blacklistHandler(interaction);
            case "credito":
                return this.creditoHandler(interaction);
        }
    },
    async betHandler(interaction) {
        const acão = interaction.options.getString("acão");
        const betId = interaction.options.getString("bet_id");
        const user = interaction.options.getUser("usuário") || interaction.user;
        const bet = await Bet.findOne({ "_id": betId }); // Add 'await'
        if (!bet) return interaction.reply({ content: "# Aposta nao encontrada", flags: 64 });

        if (acão == "addwin") {
            const result = await setBetWinner(bet, user);
            bet.winner = user.id;
            await bet.save();

            if (interaction.replied || interaction.deferred) interaction.followUp({ embeds: [result.embed] }).catch(console.error);
            else interaction.reply({ embeds: [result.embed] }).catch(console.error);
        }

        if (acão == "removewin") {
            const result2 = await removeWinBet(user.id, bet, interaction);
            if (interaction.replied || interaction.deferred) interaction.followUp({ embeds: [result2.embed] }).catch(console.error);
            else interaction.reply({ embeds: [result2.embed] }).catch(console.error);
        }

        if (acão.startsWith("status")) {
            const wantedStatus = acão.split("_")[1];

            bet.status = wantedStatus;
            await bet.save();

            interaction.reply({ content: `# Estado da aposta mudado com sucesso! Para **${wantedStatus}**`, flags: 64 });
        }
    },
    async configHandler(interaction) {
        const option = interaction.options.getString("option");
        let serverConfig = await Config.findOne({ "guild.id": interaction.guildId });

        if (!serverConfig) {
            serverConfig = new Config({
                guild: { id: interaction.guildId, name: interaction.guild.name },
                state: { bets: { status: "on" }, rank: { status: "on" } }
            });
            await serverConfig.save();
        }

        const status = serverConfig.state[option].status;
        const newStatus = serverConfig.state[option].status = status === "on" ? "off" : "on";
        await serverConfig.save();

        const embed = new EmbedBuilder()
            .setColor(myColours.rich_black)
            .setTitle(`Mudança de estado: ${option.toUpperCase()}`)
            .setDescription(`**${option}** foi alterado de **${status}** para **${newStatus}**.`)
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    },
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @returns 
     */
    async blacklistHandler(interaction) {
        const acão = interaction.options.getString("acão");
        const user = interaction.options.getUser("usuário");
        const serverConfig = await Config.findOne({ "guild.id": interaction.guildId }) || new Config({
            guild: { id: interaction.guildId, name: interaction.guild.name },
            blacklist: []
        });

        const logChannel = interaction.guild.channels.cache.get("1340360434414522389");

        if (acão === "add") {
            if (serverConfig.blacklist.some(id => id.startsWith(user.id))) {
                return await interaction.reply({ content: `# ${user} já está na blacklist!`, flags: 64 });
            }
            serverConfig.blacklist.push(`${user.id}-${interaction.user.id}-${Date.now()}`);
            await serverConfig.save();

            const embed = new EmbedBuilder()
                .setTitle("Blacklist")
                .setColor(myColours.rich_black)
                .setDescription(`${user} foi adicionado à blacklist!\n\n-# Por <@${interaction.user.id}>`)
                .setTimestamp()
                .setThumbnail(user.displayAvatarURL());

            if (logChannel) logChannel.send({ embeds: [embed] });
            await interaction.reply({ embeds: [embed] });

        } else if (acão === "remove") {
            if (!serverConfig.blacklist.some(id => id.startsWith(user.id))) {
                return await interaction.reply({ content: `# ${user} não está na blacklist!`, flags: 64 });
            }

            // Fix: Correctly filter out entries that belong to the user
            serverConfig.blacklist = serverConfig.blacklist.filter(id => !id.startsWith(user.id));
            await serverConfig.save();

            const embed = new EmbedBuilder()
                .setTitle("Blacklist")
                .setColor(myColours.rich_black)
                .setDescription(`${user} foi removido da blacklist!\n-# Por <@${interaction.user.id}>`)
                .setTimestamp()
                .setThumbnail(user.displayAvatarURL());

            if (logChannel) logChannel.send({ embeds: [embed] });
            await interaction.reply({ embeds: [embed] });
        }
    },
    async creditoHandler(interaction) {
        const acão = interaction.options.getString("acão");
        const user = interaction.options.getUser("usuário");
        const amount = interaction.options.getInteger("quantidade");

        if (acão === "add") {
            const result = await addWins(user.id, interaction, "manage", amount);
            if (interaction.replied || interaction.deferred) interaction.followUp({ embeds: [result.embed] }).catch(console.error);
            else interaction.reply({ embeds: [result.embed] }).catch(console.error);

        } else if (acão === "remove") {
            const result2 = await removeWin(user.id, amount, interaction, "manage");
            if (interaction.replied || interaction.deferred) interaction.followUp({ embeds: [result2.embed] }).catch(console.error);
            else interaction.reply({ embeds: [result2.embed] }).catch(console.error);
        }
    }
};
