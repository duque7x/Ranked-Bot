import {
    StringSelectMenuInteraction, EmbedBuilder, Colors, ActionRowBuilder,
    StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ChannelSelectMenuBuilder,
    ChannelSelectMenuInteraction, ChannelType,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    Message,
    TextChannel,
    RoleSelectMenuBuilder,
    MessageFlags
} from "discord.js";
import rest from "@duque.edits/rest";
import generateDashboard from "../../../panels/generateDashboard";
import { Bot } from "../../../../structures/Client";

type Channel = {
    type: string;
    ids: string[];
}
type Categories = Channel[];

export async function gl_categories(guildApi: rest.Guild, interaction: StringSelectMenuInteraction, client: Bot) {
    try {
        await interaction.deferUpdate();

        const { channel, member } = interaction;

        const menuEmbed = (categories: Categories) => {
            let admin = categories?.find(cn => cn.type === "adminCategory")?.
                ids?.filter(id => interaction.guild.channels.cache.find(c => c.id == id) !== null)
                .map(id => `<#${id}>`)
                .join(", ");
            let main = categories?.find(cn => cn.type === "mainCategory")?.
                ids?.filter(id => interaction.guild.channels.cache.find(c => c.id == id) !== null)
                .map(id => `<#${id}>`)
                .join(", ");
            let voice = categories?.find(cn => cn.type === "betsVoiceChannel")?.
                ids?.filter(id => interaction.guild.channels.cache.find(c => c.id == id) !== null)
                .map(id => `<#${id}>`)
                .join(", ");

            return new EmbedBuilder()
                .setColor(0x818181)
                .setTitle("Categorias")
                .setDescription([
                    `Neste menu você pode adicionar ou remover categorias de uma certa especialidade`,
                    `\n **Categoria Da Administração**`,
                    `<:folders:1386363124923240508> ・ ${admin !== "" ? admin : `Não há categorias guardadas`}`,
                    `\n **Categoria Principal:**`,
                    `<:folders:1386363124923240508> ・ ${main !== "" ? main : `Não há categorias guardadas`}`,
                    `\n **Categoria Da Criação De Canais De Voz:**`,
                    `<:folders:1386363124923240508> ・ ${voice !== "" ? voice : `Não há categorias guardadas`}`,
                ].join("\n")
                )
                .setTimestamp();
        };

        const menuRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("categoriesdb_change")
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setValue("adminCategory")
                        .setEmoji(`<:folders:1386363124923240508>`)
                        .setLabel("Categoria Administração")
                        .setDescription(`Definir esta a categoria de administração`),
                    new StringSelectMenuOptionBuilder()
                        .setValue("mainCategory")
                        .setEmoji(`<:folders:1386363124923240508>`)
                        .setLabel("Categoria Principal")
                        .setDescription(`Definir esta a categoria principal`),
                    new StringSelectMenuOptionBuilder()
                        .setValue("betsVoiceChannel")
                        .setEmoji(`<:folders:1386363124923240508>`)
                        .setLabel("Categoria Da Criação De Canais De Voz")
                        .setDescription(`Definir a categoria de voz`),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('\u200b')
                        .setValue('separator1'),
                    new StringSelectMenuOptionBuilder()
                        .setValue("db_menu")
                        .setEmoji(process.env.LEFT_EMOJI)
                        .setLabel("Voltar ao menu principal")
                )
        );

        const msg = await interaction.message.edit({ embeds: [menuEmbed(guildApi.categories)], components: [menuRow] });

        const collector = msg?.createMessageComponentCollector({
            filter: c => c.customId == "categoriesdb_change" && c.user.id === member?.user.id,
            max: 50,
            time: 540_000,
            componentType: ComponentType.StringSelect
        });

        collector?.on('collect', async (int: StringSelectMenuInteraction) => {
            const value = int.values[0];
            if (value.startsWith("separator")) return int.deferUpdate();

            if (value == 'db_menu') {
                const { embed, row } = generateDashboard();
                collector.stop();
                return int.update({ embeds: [embed], components: [row] });
            }

            await int.deferReply({ flags: MessageFlags.Ephemeral });

            const translateField: Record<string, string> = {
                "adminCategory": "administração",
                "mainCategory": "principal",
                "betsVoiceChannel": "canais voz para apostas"
            }

            const baseEmbed = new EmbedBuilder()
                .setColor(Colors.Yellow)
                .setTimestamp()
                .setTitle('Adicionar/Remover Categoria')
                .setDescription([
                    `Use a seleção para adicionar ou remover umas das categorias ${translateField[value]}`,
                    "-# <:seta:1373287605852176424> Você tem **120 segundos**!"
                ].join("\n"));

            const addOrRemoveSelection = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("add_remove_cate_slc")
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setValue(`add-${value}`)
                            .setEmoji("<:add:1386365511536873604>")
                            .setLabel("Adicionar uma categoria")
                            .setDescription(`Clique para adicionar uma categoria específica`),
                        new StringSelectMenuOptionBuilder()
                            .setValue(`remove-${value}`)
                            .setEmoji("<:remove:1386412852130353317>")
                            .setLabel("Remover uma categoria")
                            .setDescription(`Clique para remover uma categoria específica`),
                    )
            );

            const selectEditedMsg = await int.editReply({ embeds: [baseEmbed], components: [addOrRemoveSelection] });

            const collector2 = selectEditedMsg.createMessageComponentCollector({
                filter: c => c.customId == "add_remove_cate_slc" && c.user.id == int.user.id,
                time: 120_000,
                max: 1,
                componentType: ComponentType.StringSelect,
            });

            collector2.on('collect', async i => {
                await i.deferUpdate();

                const [vl, categoryType] = i.values[0].split("-");
                const channelSelect = new ActionRowBuilder<ChannelSelectMenuBuilder>().setComponents(
                    new ChannelSelectMenuBuilder().setCustomId(`channelselect-${vl}`).setMaxValues(5).addChannelTypes(ChannelType.GuildCategory)
                );

                if (vl == "add") {
                    baseEmbed.setTitle(`Categoria ${translateField[categoryType]}`).setColor(0xFF8A00)
                        .setDescription([
                            "Use a seleção para adicionar uma categoria:",
                            "-# <:seta:1373287605852176424> Você tem **120 segundos**!"
                        ].join("\n"));

                    const editedReply = await i.editReply({ embeds: [baseEmbed], components: [channelSelect] });

                    const collector3 = editedReply.createMessageComponentCollector({
                        componentType: ComponentType.ChannelSelect,
                        filter: c => c.customId == `channelselect-${vl}` && c.user.id == int.user.id,
                        time: 120_000,
                        max: 1
                    });

                    collector3.on('collect', async interact => {
                        await Promise.all([interact.deferUpdate(), i.deleteReply()]);

                        for (let roleId of interact.values) await guildApi.addCategory(categoryType, roleId);
                        return interaction.message.edit({ embeds: [menuEmbed(guildApi.categories)], components: [menuRow] });
                    });
                }
                if (vl == "remove") {
                    baseEmbed.setTitle(`Categoria ${translateField[categoryType]}`).setColor(0x713D00)
                        .setDescription([
                            "Use a seleção para remover uma categoria:",
                            "-# <:seta:1373287605852176424> Você tem **120 segundos**!"
                        ].join("\n"));

                    const editedReply = await i.editReply({ embeds: [baseEmbed], components: [channelSelect] });

                    const collector3 = editedReply.createMessageComponentCollector({
                        componentType: ComponentType.ChannelSelect,
                        filter: c => c.customId == `channelselect-${vl}` && c.user.id == int.user.id,
                        time: 120_000,
                        max: 1
                    });

                    collector3.on('collect', async interact => {
                        await Promise.all([interact.deferUpdate(), i.deleteReply()]);

                        for (let roleId of interact.values) await guildApi.removeCategory(categoryType, roleId);
                        return interaction.message.edit({ embeds: [menuEmbed(guildApi.categories)], components: [menuRow] });
                    });
                }
            });
        });
    } catch (error) {
        return console.error(error);
    }
}