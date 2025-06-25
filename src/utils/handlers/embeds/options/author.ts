import { ActionRowBuilder, ComponentType, EmbedBuilder, MessageCollector, StringSelectMenuInteraction, TextChannel, UserSelectMenuBuilder } from "discord.js";
import { Bot } from "../../../../structures/Client";
import { Guild } from "@duque.edits/rest";

export async function author(guildApi: Guild, interaction: StringSelectMenuInteraction, client: Bot, vl: string) {
    const msg = interaction.message;
    let value = vl as "title";
    const baseEmbed = EmbedBuilder.from(msg.embeds[0]);

    const row2 = new ActionRowBuilder<UserSelectMenuBuilder>().setComponents(
        new UserSelectMenuBuilder().setCustomId(`autr_slc`));
        
    await interaction.deferUpdate();
    const msg12 = await (interaction.channel as TextChannel).send({
        content: [
            `${interaction.user}, use a seleção abaixo para selecionar o autor desta mensagem!`,
            `-# <:seta:1373287605852176424> Você tem **120 segundos**!`
        ].join("\n"),
        components: [row2]
    });
    const collector3 = msg12.createMessageComponentCollector({
        filter: int => int.user.id == interaction.user.id && int.customId == "autr_slc",
        time: 200_000,
        max: 1,
        componentType: ComponentType.UserSelect
    });

    collector3.on('collect', async inter => {
        await inter.deferUpdate();

        const authorId = inter.values[0];
        const author = inter.guild.members.cache.get(authorId);

        baseEmbed.data[value as "author"] = { name: author.user.username, icon_url: author.displayAvatarURL() };
        interaction.message.edit({ embeds: [baseEmbed] });
    });
}