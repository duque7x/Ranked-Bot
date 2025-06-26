import { Match } from "@duque.edits/rest";
import { ActionRowBuilder, APIActionRowComponent, APIComponentInActionRow, ButtonBuilder, ButtonInteraction, ComponentType, EmbedBuilder } from "discord.js";
import { queueEmbed } from "../../../embeds/queueEmbed";
import { MATCHSTATUS } from "@duque.edits/rest";

export async function shutMatch(interaction: ButtonInteraction, match: Match) {
    const matchEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
    await match.setStatus(MATCHSTATUS.OFF);

    const componentData = interaction.message.components.find(c => c.type === ComponentType.ActionRow);
    const rebuiltRow = new ActionRowBuilder<ButtonBuilder>();

    for (const comp of (componentData as APIActionRowComponent<APIComponentInActionRow>).components) {
        if (comp.type === ComponentType.Button) {
            const btn = ButtonBuilder.from(comp).setDisabled(true);
            rebuiltRow.addComponents(btn);
        }
    }
    matchEmbed.setTitle(`Fila ${match.type} ╶╴ Encerrada`)
        .setColor(0xFF5858)
        .setFields({
            name: "Encerrada",
            value: `Fila foi encerrada por ${interaction.user}!`
        });

    await interaction.update({ embeds: [matchEmbed], components: [rebuiltRow] });
}