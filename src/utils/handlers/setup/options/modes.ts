import { StringSelectMenuInteraction, EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ButtonInteraction, TextChannel, Message, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import rest from "@duque.edits/rest";
import generateDashboard from "../../../panels/generateDashboard";

export async function pricesOption(guildApi: rest.Guild, interaction: StringSelectMenuInteraction) {
    try {
        const { channel } = interaction;

        const embed = (pricesOn: number[]) => new EmbedBuilder()
            .setColor(0x818181)
            .setTitle(`Preços`)
            .setDescription(
                [
                    `Selecione um preço para **ativar/desativar**:`,
                    pricesOn.length !== 0 ?
                        `-# <:seta:1373287605852176424> ${pricesOn.sort((a, b) => a - b).map(p => `${p}€`).join(", ")}` :
                        "-# <:seta:1373287605852176424> Sem preços adicionados no momento"
                ].join("\n")
            )
            .setTimestamp();

        const prices = (pricesAvailable: number[], prices: number[]) =>
            pricesAvailable.sort((a, b) => a - b).map((price: number) =>
                new StringSelectMenuOptionBuilder()
                    .setValue(`price_value_val-${price}`)
                    .setLabel(`${price}€`)
                    .setEmoji(
                        prices.includes(price) ?
                            process.env.ON_EMOJI as string :
                            process.env.OFF_EMOJI as string
                    )
            );
        const row = (pricesAvailable: number[], pricess: number[]) =>
            new ActionRowBuilder<StringSelectMenuBuilder>()
                .setComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId("prices_change")
                        .setPlaceholder("Selecione os preços:")
                        .addOptions(prices(pricesAvailable, pricess))
                        .addOptions(
                            new StringSelectMenuOptionBuilder()
                                .setLabel('\u200b')
                                .setValue('separator1'),
                            new StringSelectMenuOptionBuilder()
                                .setValue("db_menu")
                                .setEmoji(process.env.LEFT_EMOJI as string)
                                .setLabel("Voltar ao menu principal"))
                        .setMaxValues(Math.max(1, guildApi.pricesAvailable.length))
                );

        await interaction.update({ embeds: [embed(guildApi.pricesOn)], components: [row(guildApi.pricesAvailable, guildApi.pricesOn)] });

        const collector = channel?.createMessageComponentCollector({
            filter: int => int.member?.id === interaction.member?.user.id && int.customId == "prices_change",
            max: 50,
            time: 540_000,
            componentType: ComponentType.StringSelect
        });

        collector?.on(`collect`, async (int: StringSelectMenuInteraction) => {
            let value = int.values[0];
            if (value.startsWith("separator")) return int.deferUpdate();

            if (value === "db_menu") {
                const { embed, row } = generateDashboard();
                collector.stop();
                return await int.message.edit({ embeds: [embed], components: [row] });
            }
            for (let value of int.values) {
                const price = parseInt(value.split("-")[1]);

                if (guildApi.pricesOn.includes(price)) {
                    await guildApi.remove("pricesOn", price);
                    if (!guildApi?.pricesAvailable?.includes(price)) await guildApi?.remove("pricesAvailable", price);
                } else {
                    await guildApi.add("pricesOn", price);
                    if (!guildApi?.pricesAvailable?.includes(price)) await guildApi?.add("pricesAvailable", price);
                }
            }
            return int.message.edit({ embeds: [embed(guildApi.pricesOn)], components: [row(guildApi.pricesAvailable, guildApi.pricesOn)] });
        });
        return;
    } catch (error) {
        return console.error(error);
    }
}