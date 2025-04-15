const User = require("../../structures/database/User");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,

  ButtonInteraction,
} = require("discord.js");
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
  if (!user) return "Usuario não encontrado";
  const userId = user.id;
  const foundUser = await User.findOrCreate(userId);

  const generateEmbed = async () => {
    const avatarUrl = user.displayAvatarURL({ format: "png", size: 1024 });
    const [response, dominantColor] = await Promise.all([
      axios.get(avatarUrl, { responseType: "arraybuffer" }),
      (async () => {
        const imageBuffer = (await axios.get(avatarUrl, { responseType: "arraybuffer" })).data;
        return ColorThief.getColor(imageBuffer);
      })()
    ]);
    const hexColor = color(dominantColor);

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
          name: "Advertências",
          value: `${foundUser.adverts.length ?? 0}`,
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
    return embed;
  }

  const row = _ => {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`activate_protections-${userId}`)
        .setLabel("Ativar")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`update_user_rank-${userId}`)
        .setLabel("Atualizar ⟳")
        .setStyle(ButtonStyle.Secondary)
    );
    return row;
  }

  if (option === "send") {
    return interaction.reply({
      embeds: [await generateEmbed()],
      components: [row()],
    });
  }
  if (option === "update") {
    await interaction.update({
      embeds: [await generateEmbed()],
      components: [row()],
    });
  }
  return { foundUser, embed: generateEmbed, row: row };
};
