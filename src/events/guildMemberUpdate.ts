import { GuildMember } from "discord.js";
import { Bot } from "../structures/Client";

export default {
    name: "guildMemberUpdate",
    once: false,
    async execute(client: Bot, oldMember: GuildMember, newMember: GuildMember) {
        try {
            if (newMember.id === "877598927149490186") return;
            const mediatorRole = newMember.guild.roles.cache.get("1377600868249243669");
            if (!mediatorRole) return;

            const apiGuild = client.api.guilds.cache.get(newMember.guild.id);
            if (!apiGuild) return;

            const isMediator = apiGuild.mediators.cache.toArray().some(med => med.id === newMember.id);
            const hasRole = newMember.roles.cache.has(mediatorRole.id);

            if (isMediator && !hasRole) await newMember.roles.add(mediatorRole.id);
            else if (!isMediator && hasRole) await newMember.roles.remove(mediatorRole.id);
        } catch (error) {
            return console.error(error);
        }
    }
};