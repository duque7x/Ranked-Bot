import { ButtonInteraction } from "discord.js";
import { Bot } from "../../../structures/Client";
import { Collection, Guild, Match } from "@duque.edits/rest";
import { generateLeaderboard } from "../../panels/generateLeaderboard";
import { enterMatch } from "./options/enterMatch";
import { leaveMatch } from "./options/leaveMatch";
import { shutMatch } from "./options/shutMatch";

export async function matchesHandler(client: Bot, interaction: ButtonInteraction, guild: Guild) {
    let [action, matchId] = interaction.customId.split("-");
    const match = guild.matches.cache.get(matchId);

    const actionMap: Record<string, (interaction: ButtonInteraction, match: Match, guild?: Guild, client?: Bot) => any> = {
        "enter_match": enterMatch,
        "leave_match": leaveMatch,
        "shut_match": shutMatch
    }
    if (actionMap[action]) return actionMap[action](interaction, match, guild, client);
}