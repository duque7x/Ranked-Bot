const { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, SlashCommandBuilder, Colors } = require("discord.js");
const { addLoss } = require("../utils/utils");
const BotClient = require("../index");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("adicionarderrota")
        .setDescription("Este comando adiciona uma derrota a um usuario!")
        .addUserOption(option =>
            option.setName("usuário")
                .setDescription("A quem eu adiciono a vitória?")
                .setRequired(true)
        ),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {BotClient} client 
     * @returns 
     */
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply("# Você não tem permissões.");
        const user = interaction.options.getUser("usuário");

        await addLoss(user.id);
        
        const embed = new EmbedBuilder()
            .setDescription(`# Gerenciador de derrotas\n-# Derrotas adicionadas a <@${user.id}>!`)
            .setColor(Colors.White)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512, format: 'png' }))
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};
