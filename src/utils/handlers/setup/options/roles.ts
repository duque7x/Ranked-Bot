import { StringSelectMenuInteraction, EmbedBuilder, Colors, ActionRowBuilder, RoleSelectMenuBuilder, RoleSelectMenuInteraction, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, MessageFlags } from "discord.js";
import rest from "@duque.edits/rest";
import generateDashboard from "../../../panels/generateDashboard";

type Role = {
    ids: string[];
    type: string;
}

export async function roles(guildApi: rest.Guild, interaction: StringSelectMenuInteraction) {
    try {
        await interaction.deferUpdate();
        const { channel, member } = interaction;

        const menuEmbed = (roles: Role[]) => {
            let seasonRole = roles?.find(cn => cn.type === "season")?.
                ids?.filter(id => interaction.guild.roles.cache.find(c => c.id == id) !== null)
                .map(id => `<@&${id}>`)
                .join(", ");

            let mediatorsRole = roles?.find(cn => cn.type === "mediator")?.
                ids?.filter(id => interaction.guild.roles.cache.find(c => c.id == id) !== null)
                .map(id => `<@&${id}>`)
                .join(", ");

            let teamRole = roles?.find(cn => cn.type === "team")?.
                ids?.filter(id => interaction.guild.roles.cache.find(c => c.id == id) !== null)
                .map(id => `<@&${id}>`)
                .join(", ");

            return new EmbedBuilder()
                .setColor(0x818181)
                .setTitle("Cargos")
                .setDescription([
                    `Neste menu você podes adicionar ou remover cargos usados pelo bot`,
                    `\n **Cargo(s) season**`,
                    `<:stem:1386363782191906856> ・ ${seasonRole ?? `Não há cargos guardados`}`,
                    `\n **Cargo(s) mediadores**`,
                    `<:stem:1386363782191906856> ・ ${mediatorsRole ?? `Não há cargos guardados`}`,
                    `\n **Cargo(s) que podem mexer no bot:**`,
                    `<:stem:1386363782191906856> ・ ${teamRole ?? `Não há cargos guardados`}`,
                ].join("\n"))
                .setTimestamp();
        };

        const menuRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("rolesdb_change")
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setValue("season")
                        .setEmoji(`<:stem:1386363782191906856>`)
                        .setLabel("Cargo(s) da season"),
                    new StringSelectMenuOptionBuilder()
                        .setValue("mediator")
                        .setEmoji(`<:stem:1386363782191906856>`)
                        .setLabel("Cargo(s) mediador(es)"),
                    new StringSelectMenuOptionBuilder()
                        .setValue("team")
                        .setEmoji(`<:stem:1386363782191906856>`)
                        .setLabel("Cargo(s) ajudante(s)"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('\u200b')
                        .setValue('separator1'),
                    new StringSelectMenuOptionBuilder()
                        .setValue("db_menu")
                        .setEmoji(process.env.LEFT_EMOJI)
                        .setLabel("Voltar ao menu principal")
                )
        );

        const msg = await interaction.message.edit({ embeds: [menuEmbed(guildApi.roles)], components: [menuRow] });
        const collector = msg?.createMessageComponentCollector({
            filter: int => int.customId == "rolesdb_change" && int.user.id === member?.user.id,
            max: 50,
            time: 540_000,
        });

        collector?.on('collect', async (int: StringSelectMenuInteraction | RoleSelectMenuInteraction) => {
            const value = int.values[0];
            if (value.startsWith("separator")) return int.deferUpdate();

            if (value == 'db_menu') {
                const { embed, row } = generateDashboard();
                collector.stop();
                return int.update({ embeds: [embed], components: [row] });
            }

            await int.deferReply({ flags: MessageFlags.Ephemeral });

            const translateField: Record<string, string> = {
                "season": "season",
                "mediator": "mediadores",
                "team": "auxiliares"
            }

            const baseEmbed = new EmbedBuilder()
                .setColor(Colors.Yellow)
                .setTimestamp()
                .setTitle('Adicionar/Remover Cargo')
                .setDescription([
                    `Use a seleção para adicionar ou remover um dos cargos ${translateField[value]}`,
                    "-# <:seta:1373287605852176424> Você tem **120 segundos**!"
                ].join("\n"));

            const addOrRemoveSelection = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("add_remove_role_slc")
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setValue(`add-${value}`)
                            .setEmoji("<:add:1386365511536873604>")
                            .setLabel("Adicionar um cargo")
                            .setDescription(`Clique para adicionar um cargo específico`),
                        new StringSelectMenuOptionBuilder()
                            .setValue(`remove-${value}`)
                            .setEmoji("<:remove:1386412852130353317>")
                            .setLabel("Remover um cargo")
                            .setDescription(`Clique para remover um cargo específico`),
                    )
            );

            const selectEditedMsg = await int.editReply({ embeds: [baseEmbed], components: [addOrRemoveSelection] });

            const collector2 = selectEditedMsg.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                filter: c => c.customId == "add_remove_role_slc" && c.user.id == int.user.id,
                time: 120_000,
                max: 1
            });

            collector2.on('collect', async i => {
                await i.deferUpdate();

                const [vl, roleType] = i.values[0].split("-");
                const roleSelect = new ActionRowBuilder<RoleSelectMenuBuilder>().setComponents(
                    new RoleSelectMenuBuilder().setCustomId(`roleselect-${vl}`).setMaxValues(5)
                );

                if (vl == "add") {
                    baseEmbed.setTitle(`Cargo ${translateField[roleType]}`).setColor(0xFF8A00)
                        .setDescription([
                            "Use a seleção para adicionar um cargo:",
                            "-# <:seta:1373287605852176424> Você tem **120 segundos**!"
                        ].join("\n"));

                    const editedReply = await i.editReply({ embeds: [baseEmbed], components: [roleSelect] });

                    const collector3 = editedReply.createMessageComponentCollector({
                        componentType: ComponentType.RoleSelect,
                        filter: c => c.customId == `roleselect-${vl}` && c.user.id == int.user.id,
                        time: 120_000,
                        max: 1
                    });

                    collector3.on('collect', async interact => {
                        await Promise.all([interact.deferUpdate(), i.deleteReply()]);

                        for (let roleId of interact.values) await guildApi.addRole(roleType, roleId);

                        return interaction.message.edit({ embeds: [menuEmbed(guildApi.roles)], components: [menuRow] });
                    });
                }
                if (vl == "remove") {
                    baseEmbed.setTitle(`Cargo ${translateField[roleType]}`).setColor(0x713D00).setDescription([
                        "Use a seleção para remover um cargo:",
                        "-# <:seta:1373287605852176424> Você tem **120 segundos**!"
                    ].join("\n"));

                    const editedReply = await i.editReply({ embeds: [baseEmbed], components: [roleSelect] });

                    const collector3 = editedReply.createMessageComponentCollector({
                        componentType: ComponentType.RoleSelect,
                        filter: c => c.customId == `roleselect-${vl}` && c.user.id == int.user.id,
                        time: 120_000,
                        max: 1
                    });

                    collector3.on('collect', async interact => {
                        await Promise.all([interact.deferUpdate(), i.deleteReply()]);

                        for (let roleId of interact.values) await guildApi.removeRole(roleType, roleId);
                        return interaction.message.edit({ embeds: [menuEmbed(guildApi.roles)], components: [menuRow] });
                    });
                }
            });
        });
    } catch (error) {
        return console.error(error);
    }
}