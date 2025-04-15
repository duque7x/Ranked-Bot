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
        try {
            await interaction.guild.members.fetch();
            const members = interaction.guild.members.cache;

            for (const member of members.values()) {
                if (member.user.bot) continue;
                if (member.user.bot) continue;
                if (!member.roles.cache.has("1350144276834680912")) continue;
                if (!member.roles.cache.has("1338983241759064228")) await member.roles.add("1338983241759064228");

                await User.findOneAndUpdate(
                    { "player.id": member.user.id },
                    { $set: { player: { name: member.displayName, id: member.user.id } } }, // Ensures update
                    { upsert: true, new: true }
                );
            }
            return interaction.editReply({ content: "# Registrei todos os membros!" });
        } catch (error) {
            await interaction.editReply({ content: "# Ouve um erro ao registrar os membros!" });
            console.log(error);
            return;
        }
    }
};
