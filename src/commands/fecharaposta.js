const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const myColours = require("../structures/colours");
const endBetFunction = require("../utils/_functions/endBetFunction");
const Bet = require("../structures/database/match");

const { errorMessages } = require("../utils/utils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("fecharaposta")
        .setDescription("Fecha uma determinada aposta.")
        .addStringOption(option => option
            .setName("bet_id")
            .setDescription("O id da aposta")
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const bet_id = interaction.options.getString("bet_id");
        const bet = await Bet.findOne({ _id: bet_id });

        if (!bet) return interaction.reply({ content: errorMessages.bet_off, flags: 64 });

        return await endBetFunction(bet, interaction);
    }
};
