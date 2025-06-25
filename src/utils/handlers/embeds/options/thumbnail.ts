import { ActionRowBuilder, ComponentType, EmbedBuilder, MessageCollector, StringSelectMenuInteraction, TextChannel, UserSelectMenuBuilder } from "discord.js";
import { Bot } from "../../../../structures/Client";
import { Guild } from "@duque.edits/rest";

export async function thumbnail(guildApi: Guild, interaction: StringSelectMenuInteraction, client: Bot, vl: string) {
    let value = vl as "title";

    const baseEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
    const translated = "a **thumbnail** desejada.";

    await interaction.reply({
        content: [
            `Mande ${translated}`,
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

        baseEmbed.data[value as "thumbnail"] = { url: content };
        return interaction.message.edit({ embeds: [baseEmbed] });
    });
}