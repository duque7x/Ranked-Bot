const { SlashCommandBuilder, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits, ChatInputCommandInteraction } = require("discord.js");
const Config = require("../structures/database/configs");
const { sendMatchEmbed, createMatch } = require("../utils/utils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("criarfila")
        .setDescription("Cria uma fila com um tipo e canal específico.")
        .addSubcommand(sub => sub.setName("1x1").setDescription("Cria uma partida, onde outros jogadores podem entrar"))
        .addSubcommand(sub => sub.setName("2x2").setDescription("Cria uma partida, onde outros jogadores podem entrar"))
        .addSubcommand(sub => sub.setName("3x3").setDescription("Cria uma partida, onde outros jogadores podem entrar"))
        .addSubcommand(sub => sub.setName("4x4").setDescription("Cria uma partida, onde outros jogadores podem entrar"))
        .addSubcommand(sub => sub.setName("5x5").setDescription("Cria uma partida, onde outros jogadores podem entrar"))
        .addSubcommand(sub => sub.setName("6x6").setDescription("Cria uma partida, onde outros jogadores podem entrar"))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @returns 
     */
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: "# Você não tem permissões.", flags: 64 });
        const { guildId, options, guild } = interaction;

        const matchType = interaction.options.getSubcommand();
        const channelToSend = interaction.channel;

        const serverConfig = await Config.findOne({ "guild.id": guildId });

        if (serverConfig.state.matchs.status === "off") {
            return interaction.reply({ content: "-# As filas estão fechadas no momento!", flags: 64 });
        }
        try {
            await createMatch(interaction, channelToSend, matchType, true, interaction.user)
        } catch (err) {
            console.error("Erro ao criar fila:", err);
            interaction.reply({ content: "-# Ocorreu um erro ao criar a fila!", flags: 64 });
        }
    }
};
