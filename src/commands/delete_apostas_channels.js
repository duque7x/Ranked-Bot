const { SlashCommandBuilder } = require("discord.js");
const BotClient = require("..");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("delete_apostas_channels")
        .setDescription("Este comando apaga os canais de apostas!"),

    /**
     * @param {import('discord.js').CommandInteraction} interaction
     * @param {BotClient} client
     */
    async execute(interaction, client) {
        if (interaction.user.id !== "877598927149490186") return;

        const channels = interaction.guild.channels.cache.filter(c =>
            c.name.includes("emulador") || c.name.includes("mobile") || c.name.includes("mistas")
        );

        channels.forEach(async c => {
            await c.delete();
        });

        this.sendTemporaryMessage(interaction, "Canais de apostas apagados com sucesso!");
    },

    sendTemporaryMessage(interaction, content) {
        interaction.reply({ content, flags: 64 }).then(mg => {
            setTimeout(() => {
                mg.delete().catch(() => { });
            }, 2000);
        });
    }
};
