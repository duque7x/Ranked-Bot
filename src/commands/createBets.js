const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const myColours = require("../structures/colours");
const { createBet } = require("../utils/utils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("createbets")
        .setDescription("Adiciona um cargo a um usuário.")
        .addChannelOption(option =>
            option.setName("categoria")
                .setDescription("O categoria onde as apostas serao criadas.")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Apenas quem pode gerenciar cargos pode usar
    /**
     * 
     * @param {import("discord.js").Interaction} interaction 
     */
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: "# Você não tem permissões.", flgas: 64 });


        const category = interaction.options.getChannel("categoria");
        const { guild } = interaction;

        guild.channels.cache.filter(c => c.parentId == category.id && c.name !== "📄・regras・tatico").forEach(c => {
            [1, 2, 3, 5, 7, 10, 25, 50, 100].forEach(price => {
                createBet(interaction, c, price);
            });
        });

        interaction.reply("Criado!")
    },
    sendTemporaryMessage(interaction, content) {
        interaction.reply({ content, flags: 64 }).then(mg => {
            setTimeout(() => mg.delete().catch(() => { }), 2000);
        });
    }
};
