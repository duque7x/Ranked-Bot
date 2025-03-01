const { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, SlashCommandBuilder, Colors } = require("discord.js");
const { addLoss } = require("../utils/utils");
const BotClient = require("../index");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removervitoria")
        .setDescription("Este comando fecha uma aposta, você pode encontrar o id da aposta na descrição!")
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

        await addLoss(user, interaction);
        
        const embed = new EmbedBuilder()
            .setDescription(`# Gerenciador de derrotas\n-# 1 derrota foi adicionada a <@${user.id}>!`)
            .setColor(Colors.White)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512, format: 'png' }))
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};
