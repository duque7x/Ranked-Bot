import { Guild } from "@duque.edits/rest";
import { StringSelectMenuInteraction } from "discord.js";
import { Bot } from "../../../structures/Client";
import { send } from "./options/send";
import Embeds from "../../../structures/Embeds";
import { footer } from "./options/footer";
import { url } from "./options/url";
import { title } from "./options/title";
import { description } from "./options/description";
import { color } from "./options/color";
import { image } from "./options/image";
import { thumbnail } from "./options/thumbnail";
import { author } from "./options/author";
import { timestamp } from "./options/timestamp";
import { fields } from "./options/fields";

export async function embedsHandler(guild: Guild, interaction: StringSelectMenuInteraction, client: Bot) {
    let vl = interaction.values[0];

    const handlers: Record<string, (guildApi: Guild, interaction: StringSelectMenuInteraction, client: Bot, value?: string) => any> = {
        send,
        footer,
        url,
        title,
        description,
        color,
        image,
        thumbnail,
        fields,
        timestamp,
        author
    };

    try {
        if (vl.startsWith("separator")) return interaction.deferUpdate();
        if (handlers[vl]) return handlers[vl](guild, interaction, client, vl);
    } catch (error) {
        await interaction.editReply({ embeds: [Embeds.error_occured] });
        return console.error(error);
    }
}
