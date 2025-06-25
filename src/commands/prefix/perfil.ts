import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, ComponentType, EmbedBuilder, Message } from "discord.js";
import { Bot } from "../../structures/Client";
import { profileEmbed } from "../../utils/embeds/profile";
import { Guild } from "@duque.edits/rest";
import Embeds from "../../structures/Embeds";

export default {
    name: "perfil",
    alias: ["p", "perfil", "profile"],
    description: "Manda uma embed com as `estatísticas` de um usuário.",
    async execute(client: Bot, message: Message, args: string[], apiGuild: Guild) {
        try {
            args = args.filter(p => !p.startsWith("<@"));
            const mention = args[0]
                ? message.guild.members.cache.get(args[0])
                : message.guild.members.cache.get(message.mentions.users.at(0)?.id);

            const targetMember = mention ?? message.member;

            if (!targetMember) {
                return message.reply('Usuário não encontrado!');
            }

            const targetUserId = targetMember.id;
            const targetUsername = targetMember.user.username;

            const apiUser = await apiGuild?.users.fetch(
                targetUserId,
                targetUsername
            );
            const { embed } = await profileEmbed(apiUser, mention ?? message.member);
            return message.reply({ embeds: [embed] });
        } catch (error) {
            await message.reply({ embeds: [Embeds.error_occured] });
            return console.error(error);
        }
    }
}