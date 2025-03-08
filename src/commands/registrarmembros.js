const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const BotClient = require("..");
const User = require("../structures/database/User");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("registrarmembros")
        .setDescription("Este comando registra todos membros no banco de dados."),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {BotClient} client 
     * @returns 
     */
    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: "# Você não tem permissões.", flags: 64 });

        const members = interaction.guild.members.cache;
        const roleId = "1338983241759064228";
        interaction.reply({ content: "# Resgitrando...", flags: 64, withResponse: true });

        for (const member of members.values()) {
            if (member.user.bot) return;
            if (!member.roles.cache.has(roleId)) await member.roles.add(roleId).catch(console.error);

            await User.findOneAndUpdate(
                { "player.id": member.id },
                { $setOnInsert: { player: { name: member.user.username, id: member.id } } },
                { upsert: true, new: true }
            );
        }

        return interaction.editReply({ content: "# Registrei todos membros!" });
    }

};
