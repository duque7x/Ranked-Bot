import { Match } from "@duque.edits/rest";
import { ButtonInteraction, EmbedBuilder } from "discord.js";
import { queueEmbed } from "../../../embeds/queueEmbed";

export async function leaveMatch(interaction: ButtonInteraction, match: Match) {
    await match.removePlayer(interaction.user.id);

    const { embed, row } = queueEmbed(match);
    await interaction.update({ embeds: [embed], components: [row]  });
}