const { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, SlashCommandBuilder, Colors } = require("discord.js");
const { removeCredit } = require("../utils/utils");
const BotClient = require("../index");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removercredito")
        .setDescription("Este comando remove um certo credito de um usuario")
        .addUserOption(option =>
            option.setName("usuário")
                .setDescription("A quem eu adiciono a vitória?")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("quantidade")
                .addChoices(
                    { name: "1", value: 1 },
                    { name: "2", value: 2 },
                    { name: "3", value: 3 },
                    { name: "5", value: 5 },
                    { name: "7", value: 7 },
                    { name: "10", value: 10 },
                    { name: "25", value: 25 },
                    { name: "50", value: 50 },
                    { name: "100", value: 100 },
                    { name: "1200", value: 1200 },
                )
                .setDescription("Quanto vai ser adicionado?")
                .setRequired(true)
        ),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {BotClient} client 
     * @returns 
     */
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: "# Você não tem permissões.", flags: 64 });

        const user = interaction.options.getUser("usuário");
        const amount = interaction.options.getInteger("quantidade");
        const member = interaction.guild.members.cache.get(user.id);
        
        await removeCredit(user.id, amount, member.permissions.has(PermissionFlagsBits.Administrator));

        const embed = new EmbedBuilder()
            .setDescription(`# Gerenciador de credito\n-# ${amount}€ foram removidos de <@${user.id}>!`)
            .setColor(Colors.White)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512, format: 'png' }))
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};
