const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ChatInputCommandInteraction, ActionRowBuilder, Colors, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Registra opções dadas na base de dados, configura o servidor")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Apenas quem pode gerenciar cargos pode usar
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @returns 
     */
    async execute(interaction) {
        const { user, guild } = interaction;
EmbedBuilder.from
        const embed = new EmbedBuilder()
            .setTitle("Central do bot")
            .setDescription("Selecionando as opções abaixo, configure o bot!")
            .setColor(Colors.DarkNavy)
            .setImage(interaction.guild.iconURL())
            .setTimestamp()
            .setFooter({ text: "Está com problemas com a configurar o bot? Use: /equipe" });

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId(`setup_select_menu`).addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel("Definir canais de log")
                    .setValue(`logs`)
                    .setDescription("Defina os canais para: logs geral, logs de ticket, logs das filas"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Definir canais das filas")
                    .setValue(`matches`)
                    .setDescription("Defina os canais onde os usuários podem criar filas"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Definir canais do ranking")
                    .setValue(`ranking`)
                    .setDescription("Defina os canais onde os usuários podem ver o ranking"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("Auto-configuração")
                    .setValue(`auto_config`)
                    .setDescription("O bot vai: criar logs, canais de fila + ranking, cargo da season"),
            )
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};
