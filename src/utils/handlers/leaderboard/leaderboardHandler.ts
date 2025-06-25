import { ButtonInteraction } from "discord.js";
import { Bot } from "../../../structures/Client";
import { Collection, Guild } from "@duque.edits/rest";
import { generateLeaderboard } from "../../panels/generateLeaderboard";

export async function leaderboardHandler(client: Bot, interaction: ButtonInteraction, guild: Guild) {
    await interaction.deferUpdate();
    let [_, action, field, pg] = interaction.customId.split("-");
    let page = parseInt(pg);

    if (action === "forward") page++;
    if (action === "backward") page--;
    if (action === "refreash") page;
    if (page <= -1) page = 0;

    const users = (await guild.users.fetchAll()).toArray();
    const { generateEmbed, generateRows } = generateLeaderboard(new Collection(users.map(p => [p.id, p])), interaction.guild);
    return interaction.editReply({ embeds: [generateEmbed(field as "wins" | "losses" | "mvps", page)], components: [generateRows(page, field as "wins" ).row, generateRows(page, field as "wins" ).row2] });
}