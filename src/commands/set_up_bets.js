const { 
    EmbedBuilder, 
    PermissionFlagsBits, 
    Colors, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    StringSelectMenuBuilder, 
    SlashCommandBuilder 
} = require("discord.js");
const Bet = require("../structures/database/match");

const { createBet } = require("../utils/utils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("set_up_bets")
        .setDescription("Este comando cria as categorias como apostas: emu, mistas, mob! E cria as apostas, tome cuidado.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {
        if (interaction.user.id !== "877598927149490186") return;

        const amounts = [1, 2, 3, 5, 7, 10, 25, 50, 100].sort((a, b) => b - a);;
        
        const categories = [
            { name: "🚩│ APOSTAS EMU", id: "emu" },
            { name: "🚩│ APOSTAS MISTAS", id: "mistas" },
            { name: "🚩│ APOSTAS MOB", id: "mob" }
        ];

        // Create categories and channels
        for (const category of categories) {
            const categoryChannel = await interaction.guild.channels.create({
                name: category.name,
                type: 4,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: "1350144276834680912",
                        allow: [PermissionFlagsBits.ViewChannel],
                        deny: [PermissionFlagsBits.SendMessages]
                    }
                ]
            });

            for (let i = 0; i < 4; i++) {
                const channelName = `🩸・${i + 1}v${i + 1}・${category.id}`;
                const channel = await interaction.guild.channels.create({
                    name: channelName,
                    type: 0, // Text channel
                    parent: categoryChannel.id,
                   
                });

                // Create bets in the channel
                for (const amount of amounts) {
                    await createBet(interaction, channel, amount, `${i + 1}v${i + 1}`);
                }
            }
        }

        return interaction.reply("As categorias de apostas foram criadas com sucesso!");
    }
}
