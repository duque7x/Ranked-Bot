const { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, SlashCommandBuilder, Colors } = require("discord.js");
const { removeWin } = require("../utils/utils");
const BotClient = require("../index");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removervitoria")
        .setDescription("Este comando remove uma vitoria de um certo usuario")
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
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: "# Você não tem permissões.", flgas: 64 });

        const user = interaction.options.getUser("usuário");

        await removeWin(user, interaction); 
        
        const embed = new EmbedBuilder()
            .setDescription(`# Gerenciador de vitórias\n-# Vitórias removida a <@${user.id}>!`)
            .setColor(Colors.White)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512, format: 'png' }))
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};
