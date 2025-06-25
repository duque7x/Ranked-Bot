import { Colors, EmbedBuilder, GuildMemberRoleManager, Message, PermissionFlagsBits } from "discord.js";
import { Bot } from "../../structures/Client";
import generateDashboard from "../../utils/panels/generateDashboard";
import Embeds from "../../structures/Embeds";
import { Guild } from "@duque.edits/rest";

export default {
    name: "configurar",
    alias: ["config", "setup", "db", "database", "dashboard", "dash"],
    description: "Manda uma embed com o `painel de configuracao` do bot.",
    async execute(client: Bot, message: Message, args: string[], guild: Guild) {
        const isAdmin = message.member.permissions?.has(PermissionFlagsBits.Administrator);
        const allowedRoles = guild.roles.find(r => r.type == "team")?.ids;
        const hasRole = allowedRoles?.some(r => (message?.member?.roles as GuildMemberRoleManager).cache.some((r2) => r == r2.id));

        if (!isAdmin && !hasRole) return;
        try {
            const { embed, row } = generateDashboard();
            return message.reply({ embeds: [embed], components: [row] });
        } catch (error) {
            await message.reply({ embeds: [Embeds.error_occured] });
            return console.error(error);
        }
    }
}
