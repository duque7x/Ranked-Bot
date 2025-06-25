import { ActionRowBuilder, ComponentType, EmbedBuilder, MessageCollector, StringSelectMenuInteraction, TextChannel, UserSelectMenuBuilder } from "discord.js";
import { Bot } from "../../../../structures/Client";
import { Guild } from "@duque.edits/rest";

export async function timestamp(guildApi: Guild, interaction: StringSelectMenuInteraction, client: Bot, vl: string) {
    const baseEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
    let action: string;
    let hasTimestamp = baseEmbed.data.timestamp !== undefined;

    if (hasTimestamp) {
        delete baseEmbed.data.timestamp;
        action = 'removido';
    } else {
        baseEmbed.data.timestamp = new Date().toISOString();
        action = 'adicionado';
    }

    await interaction.message.edit({ embeds: [baseEmbed] });
    await interaction.reply({
        content: [
            `Timestamp **${action}** com sucesso!`,
        ].join("\n"),
        flags: 64
    });
}