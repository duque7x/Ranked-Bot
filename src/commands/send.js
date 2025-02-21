const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send')
        .setDescription('Send a message to a specific channel.')
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('O canal para mandar a mensagem')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('mensagem')
                .setDescription('A mensagem para mandar')
                .setRequired(true)),

    /**
     * 
     * @param {import("discord.js").Interaction} interaction 
     * @param {import("discord.js").Client} client 
     * @returns 
     */
    async execute(interaction, client) {
        const channel = interaction.options.getChannel('canal');
        const messageContent = interaction.options.getString('mensagem');


        channel.send(`# ${messageContent}\n||@everyone @here||`);
    },
};
