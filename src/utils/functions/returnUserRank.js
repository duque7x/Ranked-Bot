const User = require("../../structures/database/User");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  Colors,
  ButtonInteraction,
} = require("discord.js");
const verifyChannel = require("./verifyChannel");
const ColorThief = require("colorthief");
const axios = require("axios");

function color(rgb) {
  return `#${rgb.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}
/**
 *
 * @param {import("discord.js").User} user
 * @param {ButtonInteraction} interaction
 * @param {string} option
 * @returns
 */
module.exports = async (user, interaction, option) => {
  if (!user) return "Nao existe.";

  const foundUser = await User.findOneAndUpdate(
    { "player.id": user.id },
    {
      $setOnInsert: {
        player: {
          id: user.id,
          name: user.username,
        },
      },
    },
    { upsert: true, new: true }
  );
  const avatarUrl = user.displayAvatarURL({ format: "png", size: 1024 });

  // Get the dominant color from the avatar URL
  const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
  const imageBuffer = Buffer.from(response.data);

  // Get the dominant color from the buffer
  const dominantColor = await ColorThief.getColor(imageBuffer);
  const hexColor = color(dominantColor);

  // Build the embed for user profile
  const embed = new EmbedBuilder()
  .setAuthor({ name: `Perfil de ${user.username}`, iconURL: user.displayAvatarURL() })
    .setColor(hexColor)
    //.setTitle(`Estatísticas de ${user.username}`)
    .addFields(
      {
        name: "Pontos",
        value: `${foundUser.points}`,
        inline: true,
      },
      {
        name: "MVPs",
        value: `${foundUser.mvps}`,
        inline: true,
      },
      {
        name: "Vitórias",
        value: `${foundUser.wins}`,
        inline: true,
      },
      {
        name: "Derrotas",
        value: `${foundUser.losses}`,
        inline: true,
      },
      {
        name: "Vezes jogadas",
        value: `${foundUser.gamesPlayed.length}`,
        inline: true,
      },
      {
        name: "Blacklist",
        value: `${foundUser.blacklisted ? "Sim" : "Não"}`,
        inline: true,
      }
    )
    .setThumbnail(
      user.displayAvatarURL({ dynamic: true, size: 512, format: "png" })
    );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`show_protections-${user.id}`)
      .setLabel("Mostrar proteções")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`update_user_rank-${user.id}`)
      .setLabel("Atualizar ⟳")
      .setStyle(ButtonStyle.Secondary)
  );
  // Conditional reply or log the embed based on the option
  if (option === "send") {
    return interaction.reply({
      embeds: [embed],
      components: [row],
    });
  }

  return { foundUser, embed, row };
};
