const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const BotClient = require("..");
const Match = require("../structures/database/match");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("delete_apostas_channels")
        .setDescription("Este comando apaga os canais de apostas!")
        .addStringOption(option => option.setName("apagarapostas")
            .addChoices([
                {
                    name: "Sim",
                    value: "delete_apostas"
                },
                {
                    name: "Nao",
                    value: "no_delete_apostas"
                },
            ])
            .setDescription("Apagar apostas?"))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {import('discord.js').CommandInteraction} interaction
     * @param {BotClient} client
     */
    async execute(interaction, client) {
        await interaction.deferReply({ flags: 64 });
        const deletematchs = interaction.options.getString("apagarapostas");


        const channels = interaction.guild.channels.cache.filter(c =>
            c.name.split("・")[2]?.includes("emu") || c.name.split("・")[2]?.includes("mob") || c.name.split("・")[2]?.includes("mistas") || c.name.split("・")[2]?.includes("tático")
        );

        channels.forEach(async c => {
            c.parentId ?
                await c.parent.delete() :
                true;

            await c.delete();
        });

        if (deletematchs == "delete_apostas") {
            const matchs = await Match.find({});

            for (let match of matchs) {
                await match.deleteOne();
            }
        }
        await interaction.followUp({ content: "Tudo apagado.", flags: 64 });
    }
};
