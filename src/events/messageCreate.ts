import { ChannelType, Colors, EmbedBuilder, GuildMemberRoleManager, Message, PermissionFlagsBits } from "discord.js";
import { Bot } from "../structures/Client";
import { extname } from "path";
import { Headers, request } from "undici";

const Reset = "\x1b[0m";
const Bright = "\x1b[1m";
const Dim = "\x1b[2m";

const FgRed = "\x1b[31m";
const FgGreen = "\x1b[32m";
const FgYellow = "\x1b[33m";
const FgBlue = "\x1b[34m";
const FgMagenta = "\x1b[35m";
const FgCyan = "\x1b[36m";
const FgWhite = "\x1b[37m";

const event = {
    name: "messageCreate",

    async execute(client: Bot, message: Message) {
        if (message.author.bot) return;
        const guildApi = client.api.guilds.cache.get(message.guildId);
        const prefix = guildApi?.prefix ?? "!";
        const isBlacklistCHannel = guildApi.channels.find(cn => cn.type === "blacklist" && cn?.ids?.includes(message.channelId));

        if (isBlacklistCHannel) {
            const targetUser = message.mentions.users.at(0) ?? message.guild.members.cache.get(message.content)?.user;
            if (!targetUser || targetUser?.bot) return message.delete();

            const isBlacklisted = guildApi.blacklist.find(p => p.id === targetUser.id);

            if (isBlacklisted) {
                const whenTimestamp = Math.floor(isBlacklisted.when.getTime() / 1000);

                const embed = new EmbedBuilder()
                    .setTitle("Blacklist")
                    .setColor(Colors.DarkRed)
                    .setDescription([
                        `O id \`${targetUser.id}\` está na blacklist!`,
                        `-# <:seta:1373287605852176424> Inserido por <@${isBlacklisted.addedBy}> em <t:${whenTimestamp}:f>`
                    ].join("\n"))
                    .setThumbnail(message.guild.iconURL())
                    .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() });

                return message.reply({ embeds: [embed] });
            } else if (!isBlacklisted) {
                const embed = new EmbedBuilder()
                    .setTitle("Blacklist")
                    .setColor(Colors.Green)
                    .setDescription([
                        `O id \`${targetUser.id}\` não está na blacklist!`,
                    ].join("\n"))
                    .setThumbnail(message.guild.iconURL())
                    .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL() });

                return message.reply({ embeds: [embed] });
            }
        }
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();
        const command = client.prefixCommands.find(command => command.name.toLowerCase() == commandName || command.alias.find(alias => alias.toLowerCase() === commandName));
        if (!command) return;

        console.log(FgGreen + `${message.author.tag} - ${message.author.id} usou o bot as ${new Date().toISOString()}\n Comando: ${commandName}` + Reset);

        const isAdmin = message.member.permissions?.has(PermissionFlagsBits.Administrator);
        const allowedRoles = guildApi.roles.find(r => r.type == "team")?.ids;
        const hasRole = allowedRoles?.some(r => (message?.member?.roles as GuildMemberRoleManager).cache.some((r2) => r == r2.id));

        const isCooling = client.cooldowns.find(u => u.id === message.author.id && u.type === "message");

        if (isCooling) {
            const millisecondsLeft = isCooling.expiresAt - Date.now();

            if (millisecondsLeft > 0) {
                const secondsLeft = Math.ceil(millisecondsLeft / 1000);
                const content = `Aguarde **${secondsLeft} segundo(s)** para usar comandos novamente.`;
                return message.reply({ content });
            } else {
                client.cooldowns.delete(message.author.id);
            }
        }
        if (!isAdmin || !hasRole) {
            client.cooldowns.set(message.author.id, {
                expiresAt: Date.now() + 3000,
                time: 3000,
                type: "message",
                id: message.author.id
            });
        }
        return command.execute(client, message, args, guildApi);
    }
};

export default event;
