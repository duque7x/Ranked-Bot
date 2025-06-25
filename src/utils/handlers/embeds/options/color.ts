import { ActionRowBuilder, ComponentType, EmbedBuilder, MessageCollector, StringSelectMenuInteraction, TextChannel, UserSelectMenuBuilder } from "discord.js";
import { Bot } from "../../../../structures/Client";
import { Guild } from "@duque.edits/rest";
import { setFieldToEmbed } from "./setFieldToEmbed";
import { hexToNumber } from "../../../hexToNumber";
import { isHexString } from "../../../isHexString";

export async function color(guildApi: Guild, interaction: StringSelectMenuInteraction, client: Bot, vl: string) {
    let value = vl as "title";

    const baseEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
    const translated = "a **cor** desejada (use uma cor hexadecimal como: __#181818__)";

    await interaction.reply({
        content: [
            `Mande ${translated}.`,
            `-# <:seta:1373287605852176424> Você tem **200 segundos**!`
        ].join("\n"), withResponse: true
    });

    const collector2 = interaction.channel.createMessageCollector({
        filter: msg => msg.author.id == interaction.user.id,
        time: 200_000,
        max: 1,
    });
    collector2.on('collect', async mess => {
        const { content } = mess;
        if (mess && mess.deletable) await mess.delete();
        await interaction.deleteReply();

        if (!isHexString(content)) return (mess.channel as TextChannel).send(`__Cor ${content} não é um hexadecimal!__`);
        const hex = hexToNumber(content);
        return setFieldToEmbed(baseEmbed, interaction, collector2, hex.toString(), value);
    });
}