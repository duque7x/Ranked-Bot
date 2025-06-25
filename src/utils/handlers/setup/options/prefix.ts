import {
    StringSelectMenuInteraction, EmbedBuilder, Colors, ActionRowBuilder,
    StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType,
    TextChannel, Message,
    MessageFlags
} from "discord.js";
import rest from "@duque.edits/rest";
import generateDashboard from "../../../panels/generateDashboard";

export async function prefixOption(guildApi: rest.Guild, interaction: StringSelectMenuInteraction) {
    try {
        const userId = interaction.user.id;
        const channel = interaction.channel as TextChannel;

        const menuEmbed = new EmbedBuilder()
            .setColor(0x818181)
            .setTitle("Prefixo")
            .setDescription(
                [
                    `Neste menu você pode conferir ou alterar o prefixo guardado.`,
                    `-# <:seta:1373287605852176424> Prefixo guardado: ${guildApi.prefix}`
                ].join("\n")
            )
            .setTimestamp();

        const menuRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("prefix_change")
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setValue("prefix_change")
                        .setEmoji(process.env.RIGHT_EMOJI!)
                        .setLabel("Mudar prefixo"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('\u200b')
                        .setValue('separator1'),
                    new StringSelectMenuOptionBuilder()
                        .setValue("db_menu")
                        .setEmoji(process.env.LEFT_EMOJI!)
                        .setLabel("Voltar ao menu principal"),
                )
        );

        await interaction.update({ embeds: [menuEmbed], components: [menuRow] });

        const selectCollector = channel.createMessageComponentCollector({
            filter: int => int.user.id === userId && int.customId == "prefix_change",
            max: 3,
            time: 540_000,
            componentType: ComponentType.StringSelect,
        });

        selectCollector.on("collect", async (int: StringSelectMenuInteraction) => {
            const value = int.values[0];
            if (value.startsWith("separator")) return int.deferUpdate();

            if (value === "db_menu") {
                const { embed: dashEmbed, row: dashRow } = generateDashboard();
                await int.update({ embeds: [dashEmbed], components: [dashRow] });
                selectCollector.stop(); // clean collector
            }
            if (value === "prefix_change") {
                await int.reply("Insira o **novo** prefixo:");

                const msgCollector = channel.createMessageCollector({
                    filter: msg => msg.author.id === userId,
                    max: 1,
                    time: 120_000,
                });

                msgCollector.on("collect", async (msg: Message) => {
                    try {
                        await guildApi.add("prefix", msg.content);

                        const updatedEmbed = new EmbedBuilder()
                            .setColor(0x818181)
                            .setTitle("Prefixo")
                            .setDescription(
                                [
                                    `Neste menu você pode conferir ou alterar o prefixo guardado.`,
                                    `-# <:seta:1373287605852176424> Prefixo guardado: ${msg.content}`
                                ].join("\n")
                            )
                            .setTimestamp();

                        if (interaction.message.editable) await interaction.message.edit({ embeds: [updatedEmbed], components: [menuRow] });
                        if (msg.deletable) await msg.delete();
                        await int.deleteReply();
                    } catch (err) {
                        console.error("Erro ao atualizar o prefixo:", err);
                        await int.editReply({ content: "Erro ao salvar o prefixo. Tente novamente." });
                    }
                });
            }  
        });
    } catch (error) {
        return console.error(error);
    }
}
