import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, ComponentType, EmbedBuilder, Message } from "discord.js";
import { Bot } from "../../structures/Client";
import { profileEmbed } from "../../utils/embeds/profile";
import { Guild, MATCHTYPES } from "@duque.edits/rest";
import Embeds from "../../structures/Embeds";
import { queueEmbed } from "../../utils/embeds/queueEmbed";

export default {
    name: "fila",
    alias: ["fila"],
    description: "Cria uma fila com modos: 1v1, 2v2, 3v3, 4v4",
    async execute(client: Bot, message: Message, args: string[], apiGuild: Guild) {
        try {
            const type = args[0];
            const allowedTypes = [1, 2, 3, 4, 5, 6].map(el => [`${el}v${el}`, `${el}x${el}`]).flat();
            if (!type || !allowedTypes.includes(type)) return message.reply([
                `Tipo de fila nao aceite!`,
                `-# <:seta:1387547036965933086> Aceites: \`${allowedTypes.join(", ")}\``
            ].join(`\n`));
            console.log({ type, r: Number(type[0]) });

            const match = await apiGuild.matches.create({ creator: { id: message.author.id, name: message.author.username }, maximumSize: Number(type[0]), type: type as MATCHTYPES })
            const { embed, row } = queueEmbed(match);

            return message.reply({ embeds: [embed], components: [row] });
        } catch (error) {
            await message.reply({ embeds: [Embeds.error_occured] });
            return console.error(error);
        }
    }
}