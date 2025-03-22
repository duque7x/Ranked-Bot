const { SlashCommandBuilder, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require("discord.js");
const Config = require("../structures/database/configs");
const { sendMatchEmbed, createMatch } = require("../utils/utils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("criarfila")
        .setDescription("Cria uma fila com um tipo e canal específico.")
        .addStringOption(option =>
            option.setName("tipo")
                .setDescription("O tipo de fila (ex: 4v4, 4x4).")
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName("canal")
                .setDescription("O canal onde a fila será enviada.")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: "# Você não tem permissões.", flags: 64 });
        const { guildId, options, guild } = interaction;

        const matchType = options.getString("tipo");
        const channelToSend = options.getChannel("canal") ?? interaction.channel;

        const serverConfig = await Config.findOne({ "guild.id": guildId }) ?? new Config({ guild: { id: guildId, name: guild.name }, state: { matchs: { status: "on" }, rank: { status: "on" } } });

        if (serverConfig.state.matchs.status === "off") {
            return interaction.reply({ content: "-# As filas estão fechadas no momento!", flags: 64 });
        }

        if (!["1x1", "2x2", "3x3", "4x4", "5x5", "6x6", "1v1", "2v2", "3v3", "4v4", "5v5", "6v6"].includes(matchType)) {
            return interaction.reply({ content: "# Tipo de fila inválido!", flags: 64 });
        }
        try {
            await createMatch(interaction, channelToSend, matchType, true)
        } catch (err) {
            console.error("Erro ao criar fila:", err);
            interaction.reply({ content: "-# Ocorreu um erro ao criar a fila!", flags: 64 });
        }
    }
};
