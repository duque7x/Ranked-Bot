const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Match = require("../structures/database/match");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ajeitardb")
        .setDescription("Ajeita a db meu mano.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 }); // Fixed: Removed `content`

        const matches = await Match.find();

        for (let match of matches) {
            let update = [];

            // Convert array fields to strings (use first value or default)
            if (Array.isArray(match.matchType)) {
                match.matchType = match.matchType[0] || "";
                update[match.matchType + match._id] = "yes";
            }
            if (Array.isArray(match.status)) {
                match.status = match.status[0] || "on";
                update[match.status + match._id] = "yes";
            }
            if (Array.isArray(match.amount)) {
                match.amount = match.amount[0] || "1";
                update[match.amount + match._id] = "yes";
            }

            // Ensure 'payed' is a Boolean
            if (typeof match.payed !== "boolean") match.payed = Boolean(match.payed);

            // Apply updates only if needed
            if (Object.keys(update).length > 0) {
                await match.save();
            }
        }

        await interaction.followUp({ content: "DB atualizada.", flags: 64 });
    }
};
