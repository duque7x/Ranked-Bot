import { EmbedBuilder, GuildMemberRoleManager, Interaction, MessageFlags, PermissionFlagsBits, Role } from "discord.js";
import { Bot } from "../structures/Client";
import { SlashCommand } from "../types/SlashCommand";
import rest from "@duque.edits/rest";
import setupHandler from "../utils/handlers/setup/setupHandler";
import { leaderboardHandler } from "../utils/handlers/leaderboard/leaderboardHandler";
import { embedsHandler } from "../utils/handlers/embeds/embedsHandler";

const Reset = "\x1b[0m";
const FgCyan = "\x1b[36m";
const FgRed = "\x1b[31m";
const FgYellow = "\x1b[33m";
const FgBlue = "\x1b[34m";
const FgMagenta = "\x1b[35m";


export default {
    name: "interactionCreate",

    async execute(client: Bot, interaction: Interaction) {
        const guildApi = client.api.guilds.cache.get(interaction.guildId);

        const isAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
        const allowedRoles = guildApi?.roles?.find(r => r.type == "team")?.ids;
        const hasRole = allowedRoles?.some(r => (interaction?.member?.roles as GuildMemberRoleManager).cache.some((r2: Role) => r == r2.id));

        const isCooling = client.cooldowns.find(u => u.id === interaction.user.id && u.type === "interaction");
        if (isCooling) {
            const millisecondsLeft = isCooling.expiresAt - Date.now();

            if (millisecondsLeft > 0 && (!isAdmin && !hasRole)) {
                if (interaction.isRepliable()) {
                    const secondsLeft = Math.ceil(millisecondsLeft / 1000);
                    const content = `Aguarde **${secondsLeft} segundo(s)** para interagir novamente.`;

                    if (interaction.deferred || interaction.replied) {
                        return interaction.editReply({ content });
                    } else {
                        return interaction.reply({ content, flags: MessageFlags.Ephemeral });
                    }
                }
            } else {
                client.cooldowns.delete(interaction.user.id);
            }
        }

        if (!isAdmin || !hasRole) {
            client.cooldowns.set(interaction.user.id, {
                expiresAt: Date.now() + 3000,
                time: 3000,
                type: "interaction",
                id: interaction.user.id
            });
        }

        if (interaction.isChatInputCommand()) {
            const command: SlashCommand | undefined = client.slashCommands.find(command => command.data.name === interaction.commandName);
            if (!command) return;
            if (command.adminOnly && !isAdmin && !hasRole) {
                console.log(FgRed + `${interaction.user.tag} tentou usar o comando ${command.data.name} mais não tem permissões 🤣.` + Reset);
                return interaction.reply({ content: `**Pensou** né?`, flags: 64 });
            }
            console.log(FgCyan + `${interaction.user.tag} - ${interaction.user.id} usou o bot as ${new Date().toISOString()} comando: ${command.data.name}` + Reset);
            return command.execute(client, interaction, guildApi);
        }

        if (interaction.isStringSelectMenu()) {
            const { customId, values } = interaction;
            const [action, field] = customId.split("-");
            const value = values[0];

            if (action.startsWith("separator") || value.startsWith("separator")) return interaction.deferUpdate();

            console.log(FgYellow + `${interaction.user.tag} - ${interaction.user.id} usou o bot as ${new Date().toISOString()}. CustomId: ${customId}` + Reset);


            if (customId === "setup") {
                if (!isAdmin && !hasRole) return interaction.reply({ content: "Você não tem permissões para usar este comando!", flags: MessageFlags.Ephemeral });
                return await setupHandler(guildApi, interaction, value, client);
            }
            if (action === "creat_emds") {
                if (!isAdmin && !hasRole) return interaction.reply({ content: "Você não tem permissões para usar este comando!", flags: MessageFlags.Ephemeral });
                return embedsHandler(guildApi, interaction, client);
            }
        }
        if (interaction.isButton()) {
            const { customId } = interaction;
            const [action, _id] = customId.split("-");

            console.log(FgBlue + `${interaction.user.tag} - ${interaction.user.id} usou o bot as ${new Date().toISOString()}\n CustomId: ${customId}` + Reset);

            const rankingCustomId = ["ld", "ld_cts"];
            if (rankingCustomId.includes(action)) return leaderboardHandler(client, interaction, guildApi);
        }
        if (interaction.isModalSubmit()) {
            const { customId } = interaction;
            console.log(FgMagenta + `${interaction.user.tag} - ${interaction.user.id} usou o bot as ${new Date().toISOString()}\n CustomId: ${customId}` + Reset);

            const [_, action, messageId] = customId.split("-");
            const message = await interaction.channel.messages.fetch(messageId);

            const baseEmbed = EmbedBuilder.from(message.embeds[0]);
            await interaction.deferUpdate();

            if (_ == "mdl_fields") {
                if (action == "add") {
                    const name = interaction.fields.getTextInputValue('fieldname');
                    const fieldValue = interaction.fields.getTextInputValue('value');
                    const inline = interaction.fields.getTextInputValue('inline');

                    const positveInlineTypes = ['sim', 'yes', 'true'];

                    baseEmbed.addFields({ name, value: fieldValue, inline: positveInlineTypes.includes(inline) });
                    return message.edit({ embeds: [baseEmbed] });
                } else if (action == "remove") {
                    const name = interaction.fields.getTextInputValue('fieldname');

                    baseEmbed.data.fields = baseEmbed.data.fields.filter(f => f.name !== name);
                    return message.edit({ embeds: [baseEmbed] });
                }
            }
        }
    }
};