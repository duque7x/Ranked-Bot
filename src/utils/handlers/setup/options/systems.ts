import rest, { GUILDSTATUS } from "@duque.edits/rest";
import { Bot } from "../../../../structures/Client";
import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder, EmbedBuilder, Colors, ComponentType } from "discord.js";
import generateDashboard from "../../../panels/generateDashboard";

export async function systemsOptions(guild: rest.Guild, interaction: StringSelectMenuInteraction, client: Bot) {
    try {
        await interaction.deferUpdate();

        const embed = new EmbedBuilder()
            .setColor(0x818181)
            .setTitle("Sistemas")
            .setDescription(
                [
                    `Neste menu você pode os conferir os sistemas ativados no bot.`,
                    `-# <:seta:1373287605852176424> Use o menu abaixo para alterar/desativar um sistema. `
                ].join("\n")
            )
            .setTimestamp();

        const keys: Record<string, { name: string, description: string, value: string }> = {
            "matches": { name: "Partidas", description: "partidas no servidor", value: "matches" },
            "dailyRank": { name: "Ranking Diario", description: "ranking diario no servidor", value: "dailyRank" },
            "createVoiceChannels": { name: "Criar canais", description: "a criação de canais voz para as partidas", value: "createVoiceChannels" },
        };

        const row = (status: GUILDSTATUS) => {
            console.log({ status });
            
            return new ActionRowBuilder<StringSelectMenuBuilder>()
                .setComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId("online_sys")
                        .addOptions(
                            [
                                ...Object.keys(status).filter(p => p !== "bets").map((st) => {
                                    return new StringSelectMenuOptionBuilder()
                                        .setLabel(keys[st].name)
                                        .setValue(keys[st].value)
                                        .setDescription(`Ativar/desativar as ${keys[st].description}`)
                                        .setEmoji(guild.status[st as keyof GUILDSTATUS] == "on" ? process.env.ON_EMOJI : process.env.OFF_EMOJI)
                                }),
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('\u200b')
                                    .setValue('separator1'),
                                new StringSelectMenuOptionBuilder()
                                    .setValue("db_menu")
                                    .setEmoji(process.env.LEFT_EMOJI)
                                    .setLabel("Voltar ao menu principal")
                            ]
                        )
                );
        }
        await interaction.message.edit({ embeds: [embed], components: [row(guild.status)] });

        const collector = interaction.channel?.createMessageComponentCollector({
            filter: int => int.member?.id === interaction.member?.user.id && int.customId === "online_sys",
            max: 50,
            time: 540_000,
            componentType: ComponentType.StringSelect
        });

        collector.on("collect", async int => {
            const value = int.values[0];
            if (value.startsWith("separator")) return int.deferUpdate();

            if (value === "db_menu") {
                const { embed: dashEmbed, row: dashRow } = generateDashboard();
                int.update({ embeds: [dashEmbed], components: [dashRow] });
                return collector.stop();
            }
            
            await int.deferUpdate();
            await guild.setStatus(
                value as keyof GUILDSTATUS,
                guild.status[value as keyof GUILDSTATUS] == "on" ?
                    "off" : "on"
            )
            return interaction.message.edit({ components: [row(guild.status)] });
        });
    } catch (error) {
        return console.error(error);
    }
}