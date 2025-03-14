const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Bet = require("../structures/database/bet");

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

        const bets = await Bet.find();

        for (let bet of bets) {
            let update = {};
            console.log(bets)
            // Convert array fields to strings (use first value or default)
            if (Array.isArray(bet.betType)) bet.betType = bet.betType[0] || "";
            if (Array.isArray(bet.status)) bet.status = bet.status[0] || "on";
            if (Array.isArray(bet.amount)) bet.amount = bet.amount[0] || "1";

            // Ensure 'payed' is a Boolean
            if (typeof bet.payed !== "boolean") bet.payed = Boolean(bet.payed);

            // Apply updates only if needed
            if (Object.keys(update).length > 0) {
                await bet.save();
            }
        }

        await interaction.followUp({ content: "DB atualizada.", flags: 64 });
    }
};
