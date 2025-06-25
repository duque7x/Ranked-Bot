import rest from "@duque.edits/rest";
import { Colors, EmbedBuilder, StringSelectMenuInteraction } from "discord.js";
import { prefixOption } from "./options/prefix";
import { pricesOption } from "./options/modes";
import { roles } from "./options/roles";
import { Bot } from "../../../structures/Client";
import { systemsOptions } from "./options/systems";
import { gl_channels } from "./options/gl_channels";
import { gl_categories } from "./options/gl_categories";
import Embeds from "../../../structures/Embeds";
import { messages } from "./options/messages";

export default async function (guildApi: rest.Guild, interaction: StringSelectMenuInteraction, value: string, client: Bot) {
    try {
        const handlers: Record<string, (guildApi: rest.Guild, interaction: StringSelectMenuInteraction, client: Bot) => any> = {
            prefix: prefixOption,
            prices: pricesOption,
            syst: systemsOptions,
            
            gl_channels,
            gl_categories,

            roles,
            messages
        };
        if (value.startsWith("separator")) return interaction.deferUpdate();
        const handler = handlers[value];
        if (handler) return handler(guildApi, interaction, client);
    } catch (error) {
        await interaction.editReply({ embeds: [Embeds.error_occured] });
        return console.error(error);
    }
}