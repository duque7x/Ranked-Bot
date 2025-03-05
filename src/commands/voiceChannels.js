const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("crate_voicechannels")
        .setDescription("Cria canais de voz para apostas.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {import("discord.js").ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: "# Você não tem permissões.", flgas: 64 });


        const { guild } = interaction;

        // Apaga canais de voz antigos que começam com "🩸・JOGANDO・"
        guild.channels.cache
            .filter(c => c.name.startsWith("🩸・JOGANDO・"))
            .forEach(c => c.delete());

        const parentChannel = guild.channels.cache.get("1338988719914618892");

        if (!parentChannel) {
            return interaction.reply({ content: "Categoria não encontrada.", flags: 64 });
        }

        for (let index = 1; index < 16; index++) {
            await guild.channels.create({
                name: `apostas・on・${index}`,
                type: ChannelType.GuildVoice,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        deny: [PermissionFlagsBits.SendMessages],
                        allow: [PermissionFlagsBits.Speak]
                    }
                ],
                parent: parentChannel.id
            });
        }

        interaction.reply({ content: "Canais de voz criados com sucesso!", flags: 64 });
    }
};
