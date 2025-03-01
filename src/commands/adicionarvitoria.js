const { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, SlashCommandBuilder } = require("discord.js");
const { addWin } = require("../utils/utils");
const BotClient = require("../index");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("adicionarvitoria")
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

        await addWin(user, interaction);

        const embed = new EmbedBuilder()
            .setDescription(`# Gerenciador de vitórias\n-# 1 foi adicionada a <@${userId}>!`)
            .setColor(myColours.bright_blue_ocean)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512, format: 'png' }))
            .setTimestamp();
            
        interaction.reply({ embeds: [embed] });
    }
};
