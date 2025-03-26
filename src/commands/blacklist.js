const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChatInputCommandInteraction } = require("discord.js");
const myColours = require("../structures/colours");
const blacklist_handler = require("../utils/_handlers/blacklist_handler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("blacklist")
        .setDescription("Adiciona ou remove alguem da blacklist")
        .addSubcommand(sub => sub
            .setName("adicionar")
            .setDescription("Adiciona um jogador a blacklist")
            .addUserOption(option => option
                .setName("usuário")
                .setDescription("Qual usuário a ser adicionado?")
                .setRequired(true)
            )
        )
        .addSubcommand(sub => sub
            .setName("remover")
            .setDescription("Remove um jogador da blacklist")
            .addUserOption(option => option
                .setName("usuário")
                .setDescription("Qual usuário a ser removido?")
                .setRequired(true)
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // Apenas quem pode gerenciar cargos pode usar
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @returns 
     */
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser("usuário");
        const logChannel = interaction.guild.channels.cache.get("1340360434414522389") ?? interaction.guild.channels.cache.find(c => c.name.includes("logs"));

        switch (subCommand) {
            case "adicionar":
                const embed = await blacklist_handler("add", interaction.guildId, user, interaction.user.id, interaction);
                await logChannel.send({ embeds: [embed] });
                return await interaction.reply({ embeds: [embed] });
            case "remover":
                const embed2 = await blacklist_handler("remove", interaction.guildId, user, interaction.user.id, interaction);
                await logChannel.send({ embeds: [embed2] });
                return await interaction.reply({ embeds: [embed2] });
        }
    }
};
