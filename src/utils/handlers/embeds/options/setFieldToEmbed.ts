import { EmbedBuilder, MessageCollector, StringSelectMenuInteraction } from "discord.js";

export function setFieldToEmbed(baseEmbed: EmbedBuilder, interaction: StringSelectMenuInteraction, collector2: MessageCollector, content: string, value: 'title') {
    baseEmbed.data[value] = content;
    interaction.message.edit({ embeds: [baseEmbed] });
    return collector2.stop();
}
