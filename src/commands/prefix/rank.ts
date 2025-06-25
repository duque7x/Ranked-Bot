import { Message } from "discord.js";
import { Bot } from "../../structures/Client";
import { generateLeaderboard } from "../../utils/panels/generateLeaderboard";
import { Guild } from "@duque.edits/rest";
import Embeds from "../../structures/Embeds";

export default {
    name: "rank",
    alias: ["r", "leaderboard", "lb"],
    description: "Manda uma embed com as `estatísticas` de todos usuários registados.",
    async execute(client: Bot, message: Message, args: string[], apiGuild: Guild) {
        try {
            const users = await apiGuild?.users.fetchAll();
            if (users.size == 0) return message.reply({ embeds: [Embeds.no_registered_players] });
            
            const { generateEmbed, generateRows } = generateLeaderboard(users, message.guild);
            return await message.reply({ embeds: [generateEmbed("wins", 0)], components: [generateRows(0, "wins").row, generateRows(0, "wins").row2] });
        } catch (error) {
            await message.reply({ embeds: [Embeds.error_occured] });
            return console.error(error);
        }
    }
}