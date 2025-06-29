import { StringSelectMenuInteraction, EmbedBuilder, Colors, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, MessageFlags, ButtonBuilder, ButtonStyle, GuildMember } from "discord.js";
import rest, { Collection, Product, ProductData, ProductsManager } from "@duque.edits/rest";
import generateDashboard from "../../../panels/generateDashboard";
import { addProduct } from "./additional/shop/addProduct";
import { removeProduct } from "./additional/shop/removeProduct";
import { updateProduct } from "./additional/shop/updateProduct";

type Products = Collection<string, Product>;

export async function shop(guildApi: rest.Guild, interaction: StringSelectMenuInteraction) {
    try {
        await interaction.deferUpdate();
        const { channel, member } = interaction;

        const menuEmbed = (products: Products) => {
            const label = products.size == 0 || products.size > 1 ? `há **${products.size} produtos** disponíveis.` : `há **${products.size} produto** disponível.`;
            const productsArray = products.toArray().map((p, index) => {
                return [
                    `-# **${index + 1}. Produto**`,
                    `<:seta:1387547036965933086> **Nome**: ${p?.name}`,
                    `<:seta:1387547036965933086> **Descrição**: ${p?.description}`,
                    `<:seta:1387547036965933086> **Preço**: ${p?.price} **coins**`,
                    `<:seta:1387547036965933086> **Emoji**: ${p?.emoji || '<:ethereum:1388622685642162336>'}`,
                ].join("\n")
            });

            return new EmbedBuilder()
                .setColor(0x818181)
                .setTitle("Loja")
                .setDescription([
                    `É possível adicionar produtos, modificar um produto ou eliminá-lo, atualmente, ${label}`,
                    ``,
                    ...productsArray || "Não há produtos adicionados."
                ].join("\n"));
        }

        const menuRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("productsdb_change")
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setValue(`add`)
                        .setLabel(`Adicionar Produto`)
                        .setDescription(`Clique para adicionar um produto a loja`)
                        .setEmoji("<:add:1388623144864059522>"),
                    new StringSelectMenuOptionBuilder()
                        .setValue(`remove`)
                        .setLabel(`Remover Produto`)
                        .setDescription(`Clique para remover um produto da loja`)
                        .setEmoji("<:remove:1388623152908861460>"),
                    new StringSelectMenuOptionBuilder()
                        .setValue(`update`)
                        .setLabel(`Atualizar Produto`)
                        .setDescription(`Clique para atualizar um produto`)
                        .setEmoji("<:refresh:1387498139556118780>"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('\u200b')
                        .setValue('separator1'),
                    new StringSelectMenuOptionBuilder()
                        .setValue("db_menu")
                        .setEmoji(process.env.LEFT_EMOJI)
                        .setLabel("Voltar ao menu principal")
                )
        );

        let updatedProducts = await guildApi.shop.products.fetchAll();
        const msg = await interaction.message.edit({ embeds: [menuEmbed(updatedProducts)], components: [menuRow] });
        const collector = msg?.createMessageComponentCollector({
            filter: int => int.customId == "productsdb_change" && int.user.id === member?.user.id,
            max: 50,
            time: 540_000,
        });

        collector?.on('collect', async (int: StringSelectMenuInteraction) => {
            const value = int.values[0];
            if (value.startsWith("separator")) return int.deferUpdate();

            if (value == 'db_menu') {
                const { embed, row } = generateDashboard();
                collector.stop();
                return int.update({ embeds: [embed], components: [row] });
            }
            await int.deferReply();
            if (value == "add") return addProduct(guildApi, updatedProducts, interaction, int, member as GuildMember, menuEmbed, menuRow);
            if (value == "remove") return removeProduct(guildApi, updatedProducts, interaction, int, member as GuildMember, menuEmbed, menuRow);
            if (value == "update") return updateProduct(guildApi, updatedProducts, interaction, int, member as GuildMember, menuEmbed, menuRow);
        });
    } catch (error) {
        return console.error(error);
    }
}