const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('enviar')
        .setDescription('Envia uma mensagem.')
        .addStringOption(option =>
            option.setName('mensagem')
                .setDescription('A mensagem para mandar')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('O canal para mandar a mensagem')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    /**
     * 
     * @param {import("discord.js").Interaction} interaction 
     * @param {import("discord.js").Client} client 
     * @returns 
     */
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: "# Você não tem permissões.", flags: 64 });

        const channel = interaction.options.getChannel('canal') ?? interaction.channel;
        const messageContent = interaction.options.getString('mensagem');


        channel.send(`@everyone`);
    },
};
