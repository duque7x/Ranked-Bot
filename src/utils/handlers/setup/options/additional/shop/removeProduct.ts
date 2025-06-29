import { Collection, Guild, Product, ProductData } from "@duque.edits/rest";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, ComponentType, EmbedBuilder, GuildMember, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder } from "discord.js";
import Embeds from "../../../../../../structures/Embeds";
type Products = Collection<string, Product>;

export async function removeProduct(guild: Guild, products: Products, interaction: StringSelectMenuInteraction, int: StringSelectMenuInteraction, member: GuildMember, menuEmbed: (products: Products) => EmbedBuilder, menuRow: ActionRowBuilder<StringSelectMenuBuilder>) {
    try {
        if (!products) {
            return int.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Sem Produtos")
                        .setDescription([
                            `Infelizmente, não há produtos para remover.`,
                            `-# <:seta:1387547036965933086> se isso foi um erro entre em contato com a equipa de suporte do bot.`
                        ].join("\n"))
                        .setColor(Colors.LightGrey)
                        .setTimestamp()
                ]
            })
        }
        const baseEmbed = new EmbedBuilder()
            .setTitle("Gestão de Produtos")
            .setDescription([
                `Bem-vindo ao menu de **Gestão de Produtos**! Aqui tu podes: **adicionar**, **remover** ou **alterar** as configurações de um produto.`,
                '',
                `Neste menu em particular podes remover um produto.`
            ].join("\n"))
            .setColor(0xAB0000)
            .setTimestamp();

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`productselect_delete`)
                .setOptions(
                    ...products.map((product, index) =>
                        new StringSelectMenuOptionBuilder()
                            .setValue(product.id.toString())
                            .setLabel(`Nome ${product.name}`)
                            .setDescription(`${product.description}`)
                            .setEmoji(product.emoji ?? "<:ethereum:1388622685642162336>")
                    ),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('\u200b')
                        .setValue('separator1'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel(`Fechar menu`)
                        .setValue(`cancel`)
                        .setEmoji("<:no:1387492621626114198>")
                        .setDescription(`Cancelar a remoção deste produto`)
                ).setMaxValues(products.length)
        )
        const reply = await int.editReply({ embeds: [baseEmbed], components: [row] });

        const collector = reply?.createMessageComponentCollector({
            filter: c => c.customId == `productselect_delete` && c.user.id === member?.user.id,
            max: 50,
            time: 540_000,
            componentType: ComponentType.StringSelect
        });

        collector.on('collect', async interact => {
            const productIds = interact.values;

            if (productIds.find(p => p == "separator1")) return interact.deferUpdate();
            if (productIds.find(p => p == "cancel")) {
                collector.stop();
                return Promise.all([interact.deferUpdate(), interact.message.delete()]);
            }
            await interact.deferUpdate();

            baseEmbed
                .setTitle("Confirmar Remoção")
                .setColor(0xFF0000)
                .setDescription([
                    `Para não haver enganos confirme a remoção dos produtos selecionados.`
                ].join("\n"))
                .setTimestamp();

            const row2 = new ActionRowBuilder<ButtonBuilder>().setComponents(
                new ButtonBuilder()
                    .setCustomId("product_remove-confirm")
                    .setLabel("Confirmar")
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId("product_remove-cancel")
                    .setLabel("Cancelar")
                    .setStyle(ButtonStyle.Secondary),
            )
            const awaitingForNewInfoMsg = await interact.editReply({
                embeds: [baseEmbed],
                components: [row2],
            });

            const collector3 = awaitingForNewInfoMsg.createMessageComponentCollector({
                filter: c => c.customId.startsWith("product_remove") && c.user.id === member?.user.id,
                max: 1,
                time: 120_000,
                componentType: ComponentType.Button
            });

            collector3.on('collect', async i => {
                const [_, action] = i.customId.split("-");
                await i.deferUpdate();

                if (action == "cancel") {
                    await Promise.all([
                        i.deleteReply(),
                        int.deleteReply(),
                        collector.stop()
                    ]);
                    return;
                }
                for (let productId of productIds) await guild.shop.products.delete(productId, "bet");

                await Promise.all([i.deleteReply(), collector.stop()]);
                let products = await guild.shop.products.fetchAll();
                return interaction.message.edit({ embeds: [menuEmbed(products)], components: [menuRow] });
            });
        });
    } catch (error) {
        console.error(error);
        return int.editReply({ embeds: [Embeds.error_occured], components: [] });
    }
}