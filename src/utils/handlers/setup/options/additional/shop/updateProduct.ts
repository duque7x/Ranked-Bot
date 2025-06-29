import { Collection, Guild, Product, ProductData } from "@duque.edits/rest";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, ComponentType, EmbedBuilder, GuildMember, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder } from "discord.js";
import Embeds from "../../../../../../structures/Embeds";
type Products = Collection<string, Product>;

export async function updateProduct(guild: Guild, products: Products, interaction: StringSelectMenuInteraction, int: StringSelectMenuInteraction, member: GuildMember, menuEmbed: (products: Products) => EmbedBuilder, menuRow: ActionRowBuilder<StringSelectMenuBuilder>) {
    try {
        if (!products) {
            return int.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Sem Produtos")
                        .setDescription([
                            `Infelizmente, não há produtos para atualizar.`,
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
                `Neste menu em particular podes alterar as configurações um produto.`
            ].join("\n"))
            .setColor(0x068A00)
            .setTimestamp();

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`productselectdb_update`)
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
                        .setDescription(`Cancelar a criação deste produto`)
                )
        )
        const reply = await int.editReply({ embeds: [baseEmbed], components: [row] });

        const collector = reply?.createMessageComponentCollector({
            filter: c => c.customId == `productselectdb_update` && c.user.id === member?.user.id,
            max: 50,
            time: 540_000,
            componentType: ComponentType.StringSelect
        });

        collector.on('collect', async interact => {
            const value = interact.values[0];

            if (value.startsWith("separator")) return interact.deferUpdate();
            if (value == "cancel") {
                collector.stop();
                return Promise.all([interact.deferUpdate(), interact.message.delete()]);
            }
            const product = await guild.shop.products.fetch(value);
            if (!product) {
                return interact.reply({ content: "Este produto não foi encontrado.", flags: 64 })
            }
            await interact.deferUpdate();

            baseEmbed
                .setTitle("Gestão de um Produto")
                .setTimestamp()
                .setColor(0xFCFF00);

            const row = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`productupdatedb-${product.id}`)
                    .setOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel(`Nome`)
                            .setValue(`name`)
                            .setEmoji(`<:pin:1388668020993294386>`)
                            .setDescription(`Alterar o nome do produto`),
                        new StringSelectMenuOptionBuilder()
                            .setLabel(`Descrição`)
                            .setValue(`description`)
                            .setEmoji("<:fire:1388668235993579530>")
                            .setDescription(`Alterar a descrição do produto`),
                        new StringSelectMenuOptionBuilder()
                            .setLabel(`Preço`)
                            .setValue(`price`)
                            .setEmoji(`<:money:1388667907998875668>`)
                            .setDescription(`Alterar o preço do produto`),
                        new StringSelectMenuOptionBuilder()
                            .setLabel(`Emoji`)
                            .setValue(`emoji`)
                            .setEmoji("<:emojis:1388668333418614929>")
                            .setDescription(`Alterar o emoji do produto`),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('\u200b')
                            .setValue('separator1'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel(`Fechar menu`)
                            .setValue(`cancel`)
                            .setEmoji("<:no:1387492621626114198>")
                            .setDescription(`Cancelar a modifição deste produto`)
                    )

            )
            const reply2 = await interact.editReply({ embeds: [baseEmbed], components: [row] });

            const collector2 = reply2?.createMessageComponentCollector({
                filter: int => int.customId == `productupdatedb-${product.id}` && int.user.id === member?.user.id,
                max: 50,
                time: 540_000,
                componentType: ComponentType.StringSelect
            });
            collector2.on('collect', async interact => {
                const fieldToUpdate = interact.values[0];
                if (fieldToUpdate.startsWith("separator")) return interact.deferUpdate();

                if (fieldToUpdate == "cancel") {
                    collector2.stop();
                    return interact.message.delete();
                }
                const awaitingForNewInfoMsg = await interact.reply({
                    content: [
                        `Envie o novo **campo** abaixo:`,
                        `-# <:seta:1387547036965933086> Você tem 3 minutos.`
                    ].join("\n"),
                });

                const collector3 = interact?.channel.createMessageCollector({
                    filter: msg => msg.author.id === member?.user.id,
                    max: 1,
                    time: 180_000,
                });

                collector3.on('collect', async message => {
                    const valueToUpdateTo = message.content;
                    const requestData = { [fieldToUpdate as 'name']: valueToUpdateTo } as ProductData;

                    await Promise.all([
                        product.update(requestData),
                        awaitingForNewInfoMsg.delete(),
                        message.delete(),
                    ]);
                    let products = await guild.shop.products.fetchAll();
                    await interaction.message.edit({ embeds: [menuEmbed(products)], components: [menuRow] });
                });
            });
        });
    } catch (error) {
        console.error(error);
        return int.editReply({ embeds: [Embeds.error_occured], components: [] });
    }
}