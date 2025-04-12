const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const BotClient = require("..");
const User = require("../structures/database/User");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("registrarmembros")
        .setDescription("Este comando registra todos membros no banco de dados.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {BotClient} client
     */
    async execute(interaction, client) {
        await interaction.reply({ content: "# Registrando...", flags: 64 });
        const members = interaction.guild.members.cache;
        const roleIds = ["1338983241759064228", "1350144276834680912"];

        for (const member of members.values()) {
            if (member.user.bot) return; // Skip bots

            for (let roleId of roleIds) {
                if (!member.roles.cache.has(roleId)) {
                    await member.roles.add(roleId).catch(console.error);
                }
            }
            await User.findOneAndUpdate(
                { "player.id": member.user.id },
                { $set: { player: { name: member.user.username, id: member.user.id } } }, // Ensures update
                { upsert: true, new: true }
            );
        }
        return interaction.editReply({ content: "# Registrei todos os membros!" });
    }
};
