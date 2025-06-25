import { Message } from "discord.js";
import { Bot } from "../../structures/Client";
import { Guild } from "@duque.edits/rest";
import Embeds from "../../structures/Embeds";
import embedPanel from "../../utils/panels/embedsPanel";

export default {
    name: "embed",
    alias: ["embeds"],
    description: "Crie sua propria embed",
    async execute(client: Bot, message: Message, args: string[], apiGuild: Guild) {
        try {
            const { embed, row } = embedPanel(message.guild);
            await message.reply({ embeds: [embed], components: [row] });
        } catch (error) {
            await message.reply({ embeds: [Embeds.error_occured] });
            return console.error(error);
        }
    }
}

