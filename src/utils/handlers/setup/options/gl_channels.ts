import {
    StringSelectMenuInteraction, EmbedBuilder, Colors, ActionRowBuilder,
    StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ChannelSelectMenuBuilder,
    ChannelSelectMenuInteraction, ChannelType,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    Message,
    TextChannel,
    MessageFlags
} from "discord.js";
import rest from "@duque.edits/rest";
import generateDashboard from "../../../panels/generateDashboard";
import { Bot } from "../../../../structures/Client";

type Channel = {
    type: string;
    ids: string[];
}
export async function gl_channels(guildApi: rest.Guild, interaction: StringSelectMenuInteraction, client: Bot) {
    try {
        await interaction.deferUpdate();

        const { channel, member } = interaction;

        const menuEmbed = (channels: Channel[]) => {
            let dailyRank = channels?.find(cn => cn.type === "dailyRank")?.
                ids?.filter(id => interaction.guild.channels.cache.find(c => c.id == id) !== null)
                .map(id => `<#${id}>`)
                .join(", ");
            let supportBetChannels = channels?.find(cn => cn.type === "support")?.
                ids?.filter(id => interaction.guild.channels.cache.find(c => c.id == id) !== null)
                .map(id => `<#${id}>`)
                .join(", ");
            let blacklist = channels?.find(cn => cn.type === "blacklist")?.
                ids?.filter(id => interaction.guild.channels.cache.find(c => c.id == id) !== null)
                .map(id => `<#${id}>`)
                .join(", ");
            let commands = channels?.find(cn => cn.type === "commands")?.
                ids?.filter(id => interaction.guild.channels.cache.find(c => c.id == id) !== null)
                .map(id => `<#${id}>`)
                .join(", ");

            return new EmbedBuilder()
                .setColor(0x818181)
                .setTitle("Canais")
                .setDescription([
                    `Neste menu você pode adicionar ou remover canais de uma certa especialidade`,
                    `\n **Canal De Ranking Diario**`,
                    `<:channel:1386363440385364108> ・ ${dailyRank !== "" ? dailyRank : `Não há canais guardados`}`,
                    `\n **Canal de Suporte Para Apostas**`,
                    `<:channel:1386363440385364108> ・ ${supportBetChannels !== "" ? supportBetChannels : `Não há canais guardados`}`,
                    `\n **Canal De Blacklist**`,
                    `<:channel:1386363440385364108> ・ ${blacklist !== "" ? blacklist : `Não há canais guardados`}`,
                    `\n **Canal De Comandos**`,
                    `<:channel:1386363440385364108> ・ ${commands !== "" ? commands : `Não há canais guardados`}`,
                ].join("\n"))
                .setTimestamp();
        };

        const menuRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("channelsdb_change")
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setValue("dailyRank")
                        .setEmoji(`<:channel:1386363440385364108>`)
                        .setLabel("Canal Do Ranking Diario")
                        .setDescription(`Definir o canal do ranking diario`),
                    new StringSelectMenuOptionBuilder()
                        .setValue("support")
                        .setEmoji(`<:channel:1386363440385364108>`)
                        .setLabel("Canal Suporte Apostas")
                        .setDescription(`Definir o canal de suporte`),
                    new StringSelectMenuOptionBuilder()
                        .setValue("blacklist")
                        .setEmoji(`<:channel:1386363440385364108>`)
                        .setLabel("Canal Blacklist")
                        .setDescription(`Definir o canal da blacklist`),
                    new StringSelectMenuOptionBuilder()
                        .setValue("commands")
                        .setEmoji(`<:channel:1386363440385364108>`)
                        .setLabel("Canal Comandos")
                        .setDescription(`Definir o canal dos comandos`),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('\u200b')
                        .setValue('separator1'),
                    new StringSelectMenuOptionBuilder()
                        .setValue("db_menu")
                        .setEmoji(process.env.LEFT_EMOJI)
                        .setLabel("Voltar ao menu principal")
                )
        );
        await interaction.message.edit({
            embeds: [

                new EmbedBuilder()
                    .setTitle("Em Manutenção")
                    .setDescription(`Esta opção está em manutenção, aguarde um momento.`)
                    .setColor(Colors.LightGrey)
                    .setTimestamp()
            ]/* , components: [menuRow] */
        });
        /* 
                const msg = await interaction.message.edit({ embeds: [menuEmbed(guildApi.channels)], components: [menuRow] });
        
                const collector = msg?.createMessageComponentCollector({
                    filter: c => c.customId == "channelsdb_change" && c.user.id === member?.user.id,
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
                        "dailyRank": "ranking diário",
                        "support": "supote",
                        "blacklist": "blacklist",
                        "commands": "comandos",
                    }
        
                    const baseEmbed = new EmbedBuilder()
                        .setColor(Colors.Yellow)
                        .setTimestamp()
                        .setTitle('Adicionar/Remover Canal')
                        .setDescription([
                            `Use a seleção para adicionar ou remover um dos canais ${translateField[value]}`,
                            "-# <:seta:1373287605852176424> Você tem **120 segundos**!"
                        ].join("\n"));
        
                    const addOrRemoveSelection = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId("add_remove_chan_slc")
                            .addOptions(
                                new StringSelectMenuOptionBuilder()
                                    .setValue(`add-${value}`)
                                    .setEmoji("<:add:1386365511536873604>")
                                    .setLabel("Adicionar um canal")
                                    .setDescription(`Clique para adicionar um canal específico`),
                                new StringSelectMenuOptionBuilder()
                                    .setValue(`remove-${value}`)
                                    .setEmoji("<:remove:1386412852130353317>")
                                    .setLabel("Remover um canal")
                                    .setDescription(`Clique para remover um canal específico`),
                            )
                    );
        
                    const selectEditedMsg = await int.editReply({ embeds: [baseEmbed], components: [addOrRemoveSelection] });
        
                    const collector2 = selectEditedMsg.createMessageComponentCollector({
                        filter: c => c.customId == "add_remove_chan_slc" && c.user.id == int.user.id,
                        time: 120_000,
                        max: 1,
                        componentType: ComponentType.StringSelect,
                    });
        
                    collector2.on('collect', async i => {
                        await i.deferUpdate();
        
                        const [vl, channelType] = i.values[0].split("-");
                        const channelSelect = new ActionRowBuilder<ChannelSelectMenuBuilder>().setComponents(
                            new ChannelSelectMenuBuilder().setCustomId(`ch_channelselect-${vl}`).setMaxValues(5).addChannelTypes(ChannelType.GuildText)
                        );
        
                        if (vl == "add") {
                            baseEmbed.setTitle(`Canal ${translateField[channelType]}`).setColor(0xFF8A00)
                                .setDescription([
                                    "Use a seleção para adicionar um canal:",
                                    "-# <:seta:1373287605852176424> Você tem **120 segundos**!"
                                ].join("\n"));
        
                            const editedReply = await i.editReply({ embeds: [baseEmbed], components: [channelSelect] });
        
                            const collector3 = editedReply.createMessageComponentCollector({
                                componentType: ComponentType.ChannelSelect,
                                filter: c => c.customId == `ch_channelselect-${vl}` && c.user.id == int.user.id,
                                time: 120_000,
                                max: 1
                            });
        
                            collector3.on('collect', async interact => {
                                await Promise.all([interact.deferUpdate(), i.deleteReply()]);
        
                                for (let roleId of interact.values) await guildApi.addChannel(channelType, roleId);
                                return interaction.message.edit({ embeds: [menuEmbed(guildApi.channels)], components: [menuRow] });
                            });
                        }
                        if (vl == "remove") {
                            baseEmbed.setTitle(`Canal ${translateField[channelType]}`).setColor(0x713D00)
                                .setDescription([
                                    "Use a seleção para remover um canal:",
                                    "-# <:seta:1373287605852176424> Você tem **120 segundos**!"
                                ].join("\n"));
        
                            const editedReply = await i.editReply({ embeds: [baseEmbed], components: [channelSelect] });
        
                            const collector3 = editedReply.createMessageComponentCollector({
                                componentType: ComponentType.ChannelSelect,
                                filter: c => c.customId == `ch_channelselect-${vl}` && c.user.id == int.user.id,
                                time: 120_000,
                                max: 1
                            });
        
                            collector3.on('collect', async interact => {
                                await Promise.all([interact.deferUpdate(), i.deleteReply()]);
        
                                for (let roleId of interact.values) await guildApi.removeChannel(channelType, roleId);
                                return interaction.message.edit({ embeds: [menuEmbed(guildApi.channels)], components: [menuRow] });
                            });
                        }
                    }); 
                }); */
    } catch (error) {
        return console.error(error);
    }
}