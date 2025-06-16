const BotClient = require("../..");
const User = require("../../structures/database/User");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ButtonInteraction,
} = require("discord.js");
const profileEmbed = require("./profileEmbed");

/**
 *
 * @param {import("discord.js").User} user
 * @param {ButtonInteraction} interaction
 * @param {string} option
 * @param {BotClient} client
 * @returns
 */
module.exports = async (user, interaction, option, client) => {
  const foundUser = await User.findOrCreate(user, interaction.guildId, client);
  
  if (!foundUser) return "Usuario não encontrado";

  const row = _ => {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`update_user_rank-${user.id}`)
        .setLabel("Atualizar")
        .setEmoji("<:refresh:1369381762530021408>")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`activate_protections-${user.id}`)
        .setLabel("Ativar")
        .setStyle(ButtonStyle.Secondary)
    );
    return row;
  }

  if (option === "send") {
    return interaction.reply({
      embeds: [await profileEmbed(foundUser, user)],
      components: [row()],
    });
  }
  if (option === "update") return interaction.update({ embeds: [await profileEmbed(foundUser, user)], components: [row()] });

  return { foundUser, embed: profileEmbed, row: row };
};
