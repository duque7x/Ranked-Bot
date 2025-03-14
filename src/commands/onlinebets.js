const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const myColours = require("../structures/colours");
const Bet = require("../structures/database/bet");
const embed = require("./embed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("onbets")
        .setDescription("Manda uma embed com as apostas online.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: "# Você não tem permissões.", flags: 64 });


        const bets = await Bet.find({});
        let embeds = [];
        
        bets.filter(bet => bet.status == "started" || bet.status == "won").forEach((bet, index) => {
            embeds.push(new EmbedBuilder()
                .setTitle(`Aposta ${index + 1}`)
                .addFields([
                    {
                        name: "Tipo de aposta:",
                        value: `${bet?.betType === "" ? "1v1" : bet.betType}`,
                        inline: true
                    },
                    {
                        name: "Quantidade:",
                        value: `${bet.amount ?? 0}`,
                        inline: true
                    },
                    {
                        name: "Jogadores",
                        value: `<@${bet.players[0]}>, <@${bet.players[1]}>`,
                        inline: true
                    },
                    {
                        name: "Ganhador:",
                        value: `<@${bet.winner}>`,
                        inline: true
                    },
                    {
                        name: "Canal em:",
                        value: `<#${bet.betChannel.id}>`,
                        inline: true
                    },
                    {
                        name: "Comecou as:",
                        value: `${this.discordTimestamp("R", bet.createdAt)}`,
                        inline: true
                    },
                    {
                        name: "Id:",
                        value: `${bet.id}`,
                        inline: true
                    },
                ]))
        });

        embeds.length !== 0 ? interaction.reply({ embeds: embeds }) : interaction.reply({ content: "# Não a apostas abertas.", flags: 64 })
    },
    discordTimestamp(format, date) {
        return `<t:${Math.floor(date / 1000)}:${format}>`;
    }
};
