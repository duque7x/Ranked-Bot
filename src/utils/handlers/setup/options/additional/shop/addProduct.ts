import { Collection, Guild, Product, ProductData } from "@duque.edits/rest";
import { ActionRowBuilder, Colors, ComponentType, EmbedBuilder, GuildMember, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder } from "discord.js";
type Products = Collection<string, Product>;

export async function addProduct(guild: Guild, products: Products, interaction: StringSelectMenuInteraction, int: StringSelectMenuInteraction, member: GuildMember, menuEmbed: (products: Products) => EmbedBuilder, menuRow: ActionRowBuilder<StringSelectMenuBuilder>) {
    const newProduct = await guild.shop.products.create({
        description: "Defina a descrição deste produto",
        name: `${products.size + 1}. Produto`,
        price: 1,
        emoji: "<:ethereum:1388622685642162336>"
    });
    const baseEmbed = new EmbedBuilder()
        .setTitle("Gestão de Produtos")
        .setDescription([
            `Bem-vindo ao menu de **Gestão de Produtos**! Aqui tu podes: **adicionar**, **remover** ou **alterar** as configurações de um produto.`,
            '',
            `Neste menu em particular podes **adicionar um produto**.`,
            `Selecione um dos campos para **defini-lo**`
        ].join("\n"))
        .setTimestamp()
        .setColor(0x00AB65);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`productupdate-${newProduct.id}`)
            .setOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`Nome`)
                    .setValue(`name`)
                    .setEmoji(`<:pin:1388668020993294386>`)
                    .setDescription(`Definir o nome do produto`),
                new StringSelectMenuOptionBuilder()
                    .setLabel(`Descrição`)
                    .setValue(`description`)
                    .setEmoji("<:fire:1388668235993579530>")
                    .setDescription(`Definir a descrição do produto`),
                new StringSelectMenuOptionBuilder()
                    .setLabel(`Preço`)
                    .setValue(`price`)
                    .setEmoji(`<:money:1388667907998875668>`)
                    .setDescription(`Definir o preço do produto`),
                new StringSelectMenuOptionBuilder()
                    .setLabel(`Emoji`)
                    .setValue(`emoji`)
                    .setEmoji("<:emojis:1388668333418614929>")
                    .setDescription(`Definir o emoji do produto`),
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

    const collector2 = reply?.createMessageComponentCollector({
        filter: int => int.customId == `productupdate-${newProduct.id}` && int.user.id === member?.user.id,
        max: 50,
        time: 540_000,
        componentType: ComponentType.StringSelect
    });
    collector2.on('collect', async interact => {
        const [_, productId] = interact.customId.split("-");
        const fieldToUpdate = interact.values[0];
        if (fieldToUpdate.startsWith("separator")) return interact.deferUpdate();

        if (fieldToUpdate == "cancel") {
            collector2.stop();
            return Promise.all([
                interact.deferUpdate(),
                interact.message.delete(),
                newProduct.delete("bet")
            ]);
        }
        const translatedFields: Record<string, string> = {
            name: "O nome foi alterado",
            description: "A descrição foi alterada",
            price: "O preço foi alterado",
            emoji: "O emoji foi alterado"
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
                newProduct.update(requestData),
                awaitingForNewInfoMsg.delete(),
                message.delete(),
            ]);
            let products = await guild.shop.products.fetchAll();
            await interaction.message.edit({ embeds: [menuEmbed(products)], components: [menuRow] });
        });
        collector3
    });
}