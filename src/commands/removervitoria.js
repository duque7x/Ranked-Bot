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
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {BotClient} client 
     * @returns 
     */
    async execute(interaction, client) {
        const user = interaction.options.getUser("usuário");

        const userProfile = await removeWin(user, interaction); 
        
        const embed = new EmbedBuilder()
            .setDescription(`# Gerenciador de vitórias\n-# Vitórias removida a <@${user.id}>!\nAgora com **${userProfile.wins}** vitória(s)`)
            .setColor(Colors.White)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512, format: 'png' }))
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};
