const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const BotClient = require("..");
const Bet = require("../structures/database/match");

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
        const deleteBets = interaction.options.getString("apagarapostas");


        const channels = interaction.guild.channels.cache.filter(c =>
            c.name.split("・")[2]?.includes("emu") || c.name.split("・")[2]?.includes("mob") || c.name.split("・")[2]?.includes("mistas") || c.name.split("・")[2]?.includes("tático")
        );

        channels.forEach(async c => {
            c.parentId ?
                await c.parent.delete() :
                true;

            await c.delete();
        });

        if (deleteBets == "delete_apostas") {
            const bets = await Bet.find({});

            for (let bet of bets) {
                await bet.deleteOne();
            }
        }
        await interaction.followUp({ content: "Tudo apagado.", flags: 64 });
    }
};
