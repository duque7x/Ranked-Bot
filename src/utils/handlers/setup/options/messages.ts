import { StringSelectMenuInteraction, EmbedBuilder, Colors, ActionRowBuilder, RoleSelectMenuBuilder, RoleSelectMenuInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, MessageFlags, ButtonBuilder } from "discord.js";
import rest from "@duque.edits/rest";
import generateDashboard from "../../../panels/generateDashboard";

type Message = {
    ids: string[];
    type: string;
}
export async function messages(guildApi: rest.Guild, interaction: StringSelectMenuInteraction) {
    try {
        const { channel, member } = interaction;

        await interaction.deferUpdate();

        const menuEmbed = (messages: Message[]) => {
            let dailyMsg = messages?.find(cn => cn.type === "dailyRank")?.
                ids?.join(", ");
            
            return new EmbedBuilder()
                .setColor(0x818181)
                .setTitle("Mensagens")
                .setDescription([
                    `Neste menu você pode adicionar/alterar mensagens do bot`,
                    `\n **Id Mensagem da ranking diario**`,
                    `<:message:1386364070764216390> ・ ${dailyMsg ?? "Mensagens não definida"}`,
                ].join("\n"))
                .setTimestamp();
        };

        const menuRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("messagesdb_change")
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setValue("dailyRank")
                        .setEmoji(`<:message:1386364070764216390>`)
                        .setLabel("Ranking diario")
                        .setDescription(`Definir a mensagem do ranking diario`),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('\u200b')
                        .setValue('separator1'),
                    new StringSelectMenuOptionBuilder()
                        .setValue("db_menu")
                        .setEmoji(process.env.LEFT_EMOJI)
                        .setLabel("Voltar ao menu principal")
                )
        );

        await interaction.message.edit({ embeds: [menuEmbed(guildApi.messages)], components: [menuRow] });

        const msg = await interaction.message.edit({ embeds: [menuEmbed(guildApi.messages)], components: [menuRow] });

        const collector = msg?.createMessageComponentCollector({
            filter: c => c.customId == "messagesdb_change" && c.user.id === member?.user.id,
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
            }

            const baseEmbed = new EmbedBuilder()
                .setColor(Colors.Yellow)
                .setTimestamp()
                .setTitle('Adicionar/Remover Mensagem')
                .setDescription([
                    `Use a seleção para adicionar ou remover uma das mensagens do ${translateField[value]}`,
                    "-# <:seta:1373287605852176424> Você tem **120 segundos**!"
                ].join("\n"));

            const addOrRemoveSelection = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("add_remove_msg_slc")
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setValue(`add-${value}`)
                            .setEmoji("<:add:1386365511536873604>")
                            .setLabel("Adicionar uma mensagem")
                            .setDescription(`Clique para adicionar uma mensagem específica`),
                        new StringSelectMenuOptionBuilder()
                            .setValue(`remove-${value}`)
                            .setEmoji("<:remove:1386412852130353317>")
                            .setLabel("Remover uma mensagem")
                            .setDescription(`Clique para remover uma mensagem específica`),
                    )
            );

            const selectEditedMsg = await int.editReply({ embeds: [baseEmbed], components: [addOrRemoveSelection] });

            const collector2 = selectEditedMsg.createMessageComponentCollector({
                filter: c => c.customId == "add_remove_msg_slc" && c.user.id == int.user.id,
                time: 120_000,
                max: 1,
                componentType: ComponentType.StringSelect,
            });

            collector2.on('collect', async i => {
                await i.deferUpdate();

                const [vl, msgType] = i.values[0].split("-");

                if (vl == "add") {
                    baseEmbed.setTitle(`Mensagem ${translateField[msgType]}`).setColor(0xFF8A00)
                        .setDescription([
                            "Envie o id da mensagem para adicionar",
                            "-# <:seta:1373287605852176424> Você tem **120 segundos**!"
                        ].join("\n"));

                    await i.editReply({ embeds: [baseEmbed] });

                    const collector3 = int.channel.createMessageCollector({
                        filter: m => m.author.id == int.user.id,
                        time: 120_000,
                        max: 1
                    });
                    collector3.on('collect', async message => {
                        const messageId = message.content;
                        await Promise.all([int.deleteReply(), guildApi.addMessage("dailyRank", messageId)]);
                        Promise.all([
                            interaction.message.edit({ embeds: [menuEmbed(guildApi.messages)], components: [menuRow] }),
                            message.delete()
                        ]);
                    });
                }
                if (vl == "remove") {
                    baseEmbed.setTitle(`Mensagem ${translateField[msgType]}`).setColor(0x713D00)
                        .setDescription([
                            "Envie o id da mensagem para remover",
                            "-# <:seta:1373287605852176424> Você tem **120 segundos**!"
                        ].join("\n"));

                    const collector3 = int.channel.createMessageCollector({
                        filter: m => m.author.id == int.user.id,
                        time: 120_000,
                        max: 1
                    });
                    collector3.on('collect', async message => {
                        const messageId = message.content;
                        await Promise.all([int.deleteReply(), guildApi.removeMessage("dailyRank", messageId)]);
                        Promise.all([
                            interaction.message.edit({ embeds: [menuEmbed(guildApi.messages)], components: [menuRow] }),
                            message.delete()
                        ]);
                    });
                }
            });
        });
    } catch (error) {
        return console.error(error);
    }
}