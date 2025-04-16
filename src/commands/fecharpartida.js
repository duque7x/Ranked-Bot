const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const Match = require("../structures/database/match");
const endMatchFunction = require("../utils/functions/endMatchFunction");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fecharpartida")
    .setDescription("Fecha uma determinada partida.")
    .addStringOption((option) =>
      option.setName("id").setDescription("O id da partida").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  /**
   * @param {import("discord.js").ChatInputCommandInteraction} interaction
   */
  async execute(interaction, client) {
    const match_id = interaction.options.getString("id");
    const match = await Match.findOne({ _id: match_id });
    await endMatchFunction(match, interaction);
  },
};
