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
        interaction.guild.members.fetch();
        await interaction.reply({ content: "# Registrando...", flags: 64 });
        const members = interaction.guild.members.cache;

        for (const member of members.values()) {
            if (member.user.bot) return; 
            if (!member.roles.cache.has("1338983241759064228")) {
                await member.roles.add("1338983241759064228").catch(console.error);
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
