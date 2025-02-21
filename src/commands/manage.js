const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const Config = require("../structures/database/configs");
const Bet = require("../structures/database/bet");
const { addWins, removeWin } = require("./utils");
const myColours = require("../structures/colours");
const { ChatInputCommandInteraction } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("manage")
        .setDescription("Gerencia configurações das apostas.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand.setName("bet")
                .setDescription("Gerencia apostas.")
                .addStringOption(option =>
                    option.setName("action")
                        .setDescription("Ação a ser executada (addwin, removewin, status).")
                        .setRequired(true)
                        .addChoices(
                            { name: "Adicionar Vitória", value: "addwin" },
                            { name: "Remover Vitória", value: "removewin" },
                            { name: "Alterar Status", value: "status" }
                        )
                )
                .addUserOption(option =>
                    option.setName("user")
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
                    option.setName("user")
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
                    option.setName("action")
                        .setDescription("Ação a ser executada (add, remove).")
                        .setRequired(true)
                        .addChoices(
                            { name: "Adicionar", value: "add" },
                            { name: "Remover", value: "remove" }
                        )
                )
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("Usuário a ser adicionado/removido da blacklist.")
                        .setRequired(true)
                )

        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const subcommand = interaction.options.getSubcommand();

        console.log(subcommand);

        switch (subcommand) {
            case "bet":
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
        const action = interaction.options.getString("action");
        const user = interaction.options.getUser("user") || interaction.user;
        const amount = interaction.options.getInteger("quantidade") || 1;

        switch (action) {
            case "addwin":
                const result = await addWins(user.id, interaction);
                if (interaction.replied || interaction.deferred) interaction.followUp({ embeds: [result.embed] }).catch(console.error);
                else interaction.reply({ embeds: [result.embed] }).catch(console.error);
                break;
            case "removewin":
                const result2 = await removeWin(user.id, interaction);
                if (interaction.replied || interaction.deferred) interaction.followUp({ embeds: [result2.embed] }).catch(console.error);
                else interaction.reply({ embeds: [result2.embed] }).catch(console.error);
                break;
            case "status":
                interaction.reply({ content: "❌ Ainda não implementado!", flags: 64 });
                break;
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
        const action = interaction.options.getString("action");
        const user = interaction.options.getUser("user");
        const serverConfig = await Config.findOne({ "guild.id": interaction.guildId }) || new Config({ 
            guild: { id: interaction.guildId, name: interaction.guild.name }, 
            blacklist: [] 
        });
    
        const logChannel = interaction.guild.channels.cache.get("1340360434414522389");
    
        if (action === "add") {
            if (serverConfig.blacklist.some(id => id.startsWith(user.id))) {
                return await interaction.reply({ content: `# ${user} já está na blacklist!`, flags: 64 });
            }
    
            console.log(serverConfig, serverConfig.blacklist.some(id => id.startsWith(user.id)));
    
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
    
        } else if (action === "remove") {
            if (!serverConfig.blacklist.some(id => id.startsWith(user.id))) {
                return await interaction.reply({ content: `# ${user} não está na blacklist!`, flags: 64 });
            }
    
            console.log(serverConfig, serverConfig.blacklist.some(id => id.startsWith(user.id)));
    
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
        const action = interaction.options.getString("acão");
        const user = interaction.options.getUser("user");
        const amount = interaction.options.getInteger("quantidade");

        if (action === "add") {
            const result = await addWins(user.id, interaction, "manage", amount);
            if (interaction.replied || interaction.deferred) interaction.followUp({ embeds: [result.embed] }).catch(console.error);
            else interaction.reply({ embeds: [result.embed] }).catch(console.error);

        } else if (action === "remove") {
            const result2 = await removeWin(user.id, amount, interaction, "manage");
            if (interaction.replied || interaction.deferred) interaction.followUp({ embeds: [result2.embed] }).catch(console.error);
            else interaction.reply({ embeds: [result2.embed] }).catch(console.error);
        }
    }
};
