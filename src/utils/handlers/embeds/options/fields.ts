import { ActionRow, ActionRowBuilder, APIActionRowComponent, APIComponentInActionRow, ButtonBuilder, ButtonStyle, Colors, ComponentType, EmbedBuilder, InteractionCollector, MessageCollector, ModalBuilder, ModalSubmitInteraction, StringSelectMenuInteraction, TextChannel, TextInputBuilder, TextInputStyle, UserSelectMenuBuilder } from "discord.js";
import { Bot } from "../../../../structures/Client";
import { Guild } from "@duque.edits/rest";

export async function fields(guildApi: Guild, interaction: StringSelectMenuInteraction, client: Bot, vl: string) {
    const baseEmbed = EmbedBuilder.from(interaction.message.embeds[0]);

    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
        new ButtonBuilder()
            .setCustomId(`ad_fl`)
            .setLabel("Adicionar")
            .setStyle(ButtonStyle.Success)
            .setEmoji(process.env.YES_EMOJI),
        new ButtonBuilder()
            .setCustomId(`rem_fl`)
            .setLabel("Remover")
            .setStyle(ButtonStyle.Danger)
            .setEmoji(process.env.NO_EMOJI),
    );

    const embed = new EmbedBuilder()
        .setTitle('Adicionar/Remover Campos')
        .setDescription([
            `${interaction.user}, Use os botões abaixo para adicionar/remover campos da embed!`,
            `-# <:seta:1373287605852176424> Você tem **10 minutos**!`
        ].join("\n"))
        .setColor(Colors.Yellow);

    const msg = await interaction.reply({
        embeds: [embed],
        components: [row],
        withResponse: true
    });

    const collector3 = msg.resource.message.createMessageComponentCollector({
        filter: int => int.user.id == interaction.user.id && (int.customId == "ad_fl" || int.customId == "rem_fl"),
        time: 600_000,
        max: 100,
        componentType: ComponentType.Button
    });

    collector3.on('collect', async inter => {
        const value = inter.customId;

        const keysMap: Record<string, string> = {
            ad_fl: "Adicionar",
            rem_fl: "Remover"
        };

        const modal = new ModalBuilder()
            .setCustomId('mdl_fields')
            .setTitle(`${keysMap[value]} campos!`);

        if (value == "ad_fl") {
            const nameFieldToAdd = new TextInputBuilder()
                .setCustomId('fieldname')
                .setLabel("Nome do campo para adicionar")
                .setStyle(TextInputStyle.Short);

            const valueOfField = new TextInputBuilder()
                .setCustomId('value')
                .setLabel("Valor deste campo")
                .setStyle(TextInputStyle.Paragraph);

            const positionOfField = new TextInputBuilder()
                .setCustomId('inline')
                .setLabel("Em linha com outros campos?")
                .setPlaceholder(`Use palavras como: sim, não, yes, no, true, false`)
                .setRequired(false)
                .setStyle(TextInputStyle.Short);

            const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(nameFieldToAdd);
            const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(positionOfField);
            const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(valueOfField);

            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow).setCustomId("mdl_fields-add-" + interaction.message.id);
            return inter.showModal(modal);
        }

        if (value == "rem_fl") {
            const fieldToRemove = new TextInputBuilder()
                .setCustomId('fieldname')
                .setLabel("Nome do campo para remover")
                .setStyle(TextInputStyle.Short);

            const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(fieldToRemove);
            modal.addComponents(firstActionRow).setCustomId("mdl_fields-remove-" + interaction.message.id);
            return inter.showModal(modal);
        }
    });

    collector3.on('end', cn => {
        const componentData = interaction.message.components.find(c => c.type === ComponentType.ActionRow);
        const rebuiltRow = new ActionRowBuilder<ButtonBuilder>();

        for (const comp of (componentData as APIActionRowComponent<APIComponentInActionRow>).components) {
            if (comp.type === ComponentType.Button) {
                const btn = ButtonBuilder.from(comp).setDisabled(true);
                rebuiltRow.addComponents(btn);
            }
        }
        return msg.resource.message.edit({ components: [rebuiltRow] });
    });
}