import { EmbedBuilder, Colors, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Guild } from "discord.js";

export default function embedPanel(guild: Guild) {
    const embed = new EmbedBuilder()
        .setColor(Colors.NotQuiteBlack)
        .setTitle(`Embed`)
        .setDescription([
            `Com este menu voce pode personalizar sua embed por total!`,
        ].join("\n"));

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .setComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`creat_emds`)
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Autor')
                        .setValue('author')
                        .setEmoji("✍️")
                        .setDescription(`Definir/Mudar o autor da embed`),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Titlo')
                        .setValue('title')
                        .setEmoji("🏷️")
                        .setDescription(`Definir/Mudar o titlo da embed`),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Cor')
                        .setValue('color')
                        .setEmoji("🎨")
                        .setDescription(`Definir/Mudar a cor da embed`),
                    new StringSelectMenuOptionBuilder()
                        .setLabel(`Descrição`)
                        .setDescription(`Definir/Mudar a descrição da embed`)
                        .setValue(`description`)
                        .setEmoji("📑"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel(`Campos`)
                        .setDescription(`Definir/Mudar os campos da embed`)
                        .setValue(`fields`)
                        .setEmoji("⭐"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel(`Footer`)
                        .setDescription(`Definir/Mudar o footer da embed`)
                        .setValue(`footer`)
                        .setEmoji("📜"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel(`Imagem`)
                        .setDescription(`Definir/Mudar a imagem da embed`)
                        .setValue(`image`)
                        .setEmoji("🖼️"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel(`Thumbnail`)
                        .setDescription(`Definir/Mudar a imagem da embed`)
                        .setValue(`thumbnail`)
                        .setEmoji("🌄"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel(`Timestamp`)
                        .setDescription(`Ativar ou desativar o timestamp`)
                        .setValue(`timestamp`)
                        .setEmoji("🕒"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel(`Url`)
                        .setDescription(`Definir/Mudar a url da embed`)
                        .setValue(`url`)
                        .setEmoji("🔗"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('\u200b')
                        .setValue('separator1'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Enviar')
                        .setValue('send')
                        .setDescription('Envie esta embed a canais')
                        .setEmoji(process.env.YES_EMOJI),
                ));
    return { embed, row };
}