import { CommandInteraction, SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from "discord.js";
import { Bot } from "../../structures/Client";
import generateDashboard from "../../utils/panels/generateDashboard";
import Embeds from "../../structures/Embeds";

export default {
    adminOnly: true,
    data: new SlashCommandBuilder().setName("configurar").setDescription("Configurar o bot"),
    async execute(client: Bot, interaction: CommandInteraction) {
        try {
            const { embed, row } = generateDashboard();
            return interaction.reply({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error(error);
            if (interaction.deferred || interaction.replied) interaction.editReply({ embeds: [Embeds.error_occured] })
            else interaction.reply({ embeds: [Embeds.error_occured], flags: 64 });

            return;
        }
    }
}
