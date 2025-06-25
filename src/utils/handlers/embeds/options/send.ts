import { EmbedBuilder, StringSelectMenuInteraction, TextChannel } from "discord.js";
import { Bot } from "../../../../structures/Client";
import { Guild } from "@duque.edits/rest";

export async function send(guildApi: Guild, interaction: StringSelectMenuInteraction, client: Bot) {
    const embed = EmbedBuilder.from(interaction.message.embeds[0]);

    await interaction.reply({
        content: [
            `Mencione **os canais** que voce deseja enviar esta embed.`,
            `-# <:seta:1373287605852176424> Você tem **60 segundos**!`
        ].join("\n")
    });
    const collector = interaction.channel.createMessageCollector({
        filter: msg => msg.author.id == interaction.user.id,
        time: 60_000,
        max: 5
    });
    collector.on('collect', async message => {
        const channels = message.mentions.channels;
        if (channels.size === 0) {
            if (message && message.deletable) await message.delete();
            return interaction.editReply([
                `${message.author}, mencione **os canais** que voce deseja enviar esta embed.`,
                `-# <:seta:1373287605852176424> Você tem **60 segundos**!`
            ].join("\n"));
        }
        for (let [id, channel] of channels) {
            if (channel.isSendable()) await channel.send({ embeds: [embed] });
        };

        await interaction.editReply([
            `${message.author}, a embed foi enviada com sucesso!`,
            `-# <:seta:1373287605852176424> **Canais**: ${channels.map(c => `<#${c.id}>`)}`
        ].join("\n"));
        collector.stop();
    });
}   