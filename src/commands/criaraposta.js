const { SlashCommandBuilder, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require("discord.js");
const Bet = require("../structures/database/bet");
const Config = require("../structures/database/configs");
const { sendBetEmbed, createBet } = require("../utils/utils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("aposta")
        .setDescription("Cria uma aposta com um tipo e canal específico.")
        .addStringOption(option =>
            option.setName("tipo")
                .setDescription("O tipo de aposta (ex: 4v4, 4x4).")
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName("canal")
                .setDescription("O canal onde a aposta será enviada.")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("quantidade")
                .setDescription("Valor da aposta (€).")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: "# Você não tem permissões.", flags: 64 });
        const { guildId, options, guild } = interaction;

        const betType = options.getString("tipo");
        const channelToSend = options.getChannel("canal");
        const amount = options.getInteger("quantidade") ?? 1;


        const serverConfig = await Config.findOne({ "guild.id": guildId })
            ?? new Config({ guild: { id: guildId, name: guild.name }, state: { bets: { status: "on" }, rank: { status: "on" } } });

        if (serverConfig.state.bets.status === "off") {
            return interaction.reply({ content: "-# As apostas estão fechadas no momento!", flags: 64 });
        }

        if (!["1x1", "2x2", "3x3", "4x4", "5x5", "6x6", "1v1", "2v2", "3v3", "4v4", "5v5", "6v6"].includes(betType)) {
            return interaction.reply({ content: "-# Tipo de aposta inválido!", flags: 64 });
        }
        try {
            const bet = await createBet(interaction, channelToSend, amount, betType)

            await sendBetEmbed(interaction, bet, channelToSend);
            
            interaction.reply({ content: "-# Aposta criada com sucesso!", flags: 64 });

        } catch (err) {
            console.error("Erro ao criar aposta:", err);
            interaction.reply({ content: "-# Ocorreu um erro ao criar a aposta!", flags: 64 });
        }
    }
};
