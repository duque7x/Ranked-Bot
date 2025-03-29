const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const myColours = require("../structures/colours");
const endMatchFunction = require("../utils/functions/endMatchFunction");
const Match = require("../structures/database/match");

const { errorMessages } = require("../utils/utils");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("fecharaposta")
        .setDescription("Fecha uma determinada aposta.")
        .addStringOption(option => option
            .setName("match_id")
            .setDescription("O id da aposta")
            .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const match_id = interaction.options.getString("match_id");
        const match = await Match.findOne({ _id: match_id });

        if (!match) return interaction.reply({ content: errorMessages.bet_off, flags: 64 });

        return await endMatchFunction(match, interaction);
    }
};
