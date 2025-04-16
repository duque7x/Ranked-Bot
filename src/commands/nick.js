const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("nick")
        .setDescription("Muda seu nome neste servidor")
        .addStringOption(op => op
            .setName("nome")
            .setDescription("Nome para ser setado")
            .setRequired(true)
        ),
    /**
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const hasRole = interaction.member.roles.cache.has("1350144276834680912");
        const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

        if (!hasRole && !isAdmin) {
            return interaction.reply({ content: "Você precisa **adquirir** o cargo da season!", flags: 64 });
        }

        const displayName = interaction.member.displayName;
        const _nN = interaction.options.getString("nome");
        const _rank = displayName.includes("|") ? displayName.split("|")[0].trim() : "";
        const _newName = _nN.includes("|") ? _nN.split("|")[1].trim() : _nN;
        let newName = _rank ? `${_rank} | ${_newName}` : _newName;

        if (newName.length > 32) {
            newName = newName.slice(0, 32);
        }

        await interaction.member.setNickname(newName);
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Mudança de nick`)
                    .setDescription(`Mudei seu nick para **${_newName}**`)
                    .setTimestamp()
                    .setFooter({ text: `Por: ${interaction.client.user.username}` })
                    .setColor(0xFF0000)
            ]
        });
    }
};
