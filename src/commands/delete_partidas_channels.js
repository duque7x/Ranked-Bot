const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const BotClient = require("..");
const Match = require("../structures/database/match");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("delete_partidas_channels")
        .setDescription("Este comando apaga os canais de partidas!")
        .addStringOption(option => option.setName("apagarpartidas")
            .addChoices([
                {
                    name: "Sim",
                    value: "delete_partidas"
                },
                {
                    name: "Nao",
                    value: "no_delete_partidas"
                },
            ])
            .setDescription("Apagar partidas?"))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {import('discord.js').CommandInteraction} interaction
     * @param {BotClient} client
     */
    async execute(interaction, client) {
        await interaction.deferReply({ flags: 64 });
        const deletematchs = interaction.options.getString("apagarpartidas");


        const channels = interaction.guild.channels.cache.filter(c =>
            c.name.split("・")[2]?.includes("emu") || c.name.split("・")[2]?.includes("mob") || c.name.split("・")[2]?.includes("mistas") || c.name.split("・")[2]?.includes("tático")
        );

        channels.forEach(async c => {
            c.parentId ?
                await c.parent.delete() :
                true;

            await c.delete();
        });

        if (deletematchs == "delete_partidas") {
            const matchs = await Match.find({});

            for (let match of matchs) {
                await match.deleteOne();
            }
        }
        await interaction.followUp({ content: "Tudo apagado.", flags: 64 });
    }
};
