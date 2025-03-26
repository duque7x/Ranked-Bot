const { SlashCommandBuilder, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits, ChatInputCommandInteraction } = require("discord.js");
const Config = require("../structures/database/configs");
const { sendMatchEmbed, createMatch } = require("../utils/utils");
const User = require("../structures/database/User");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("fila")
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
        const { guildId } = interaction;
        if (!interaction.channelId !== "1353098806123827211" && !interaction.memberPermissions.has(PermissionFlagsBits.Administrator))
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`Você não pode criar filas neste canal`)
                    .setTimestamp()
                    .setColor(0xff0000)
                ]
            });
        const serverConfig = await Config.findOne({ "guild.id": guildId });
        const userProfile = await User.findOne({ "player.id": interaction.user.id });
        if (serverConfig.state.matchs.status === "off") {
            return interaction.reply({ content: "-# As filas estão fechadas no momento!", flags: 64 });
        }
        if (userProfile.blacklisted === true) return interaction.reply({
            embeds: [new EmbedBuilder()
                .setDescription(`O id **${interaction.user.id}** esta na blacklist.\n-# Abra um ticket <#1339284682902339594> para sair.`)
                .setTimestamp()
                .setColor(Colors.Aqua)
                .setFooter({ text: "Nota: para sair da blacklist você precisa pagar 1,50€" })
            ]
        });

        const matchType = interaction.options.getSubcommand();
        const channelToSend = interaction.channel;
        try {
            await createMatch(interaction, channelToSend, matchType, true, interaction.user)
        } catch (err) {
            console.error("Erro ao criar fila:", err);
            interaction.reply({ content: "-# Ocorreu um erro ao criar a fila!", flags: 64 });
        }
    }
};
