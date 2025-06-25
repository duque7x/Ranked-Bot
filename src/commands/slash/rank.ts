import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Bot } from "../../structures/Client";
import { Guild } from "@duque.edits/rest";
import Embeds from "../../structures/Embeds";
import { generateLeaderboard } from "../../utils/panels/generateLeaderboard";

export default {
    adminOnly: false,
    data: new SlashCommandBuilder()
        .setName("rank")
        .setDescription("Veja as estatísticas do servidor"),
    async execute(client: Bot, interaction: ChatInputCommandInteraction, apiGuild: Guild) {
        try {
            await interaction.deferReply({ flags: 64 });
            const users = await apiGuild?.users.fetchAll();
            if (users.size == 0) return interaction.editReply({embeds: [Embeds.no_registered_players] });

            const { generateEmbed, generateRows } = generateLeaderboard(users, interaction.guild);
            return await interaction.editReply({ embeds: [generateEmbed("wins", 0)], components: [generateRows(0, "wins").row, generateRows(0, "wins").row2] });
        } catch (error) {
            console.error(error);
            if (interaction.deferred || interaction.replied) interaction.editReply({ embeds: [Embeds.error_occured] })
            else interaction.reply({ embeds: [Embeds.error_occured], flags: 64 });

            return;
        }
    }
}