const {
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { returnServerRank } = require("../utils/utils");
const verifyChannel = require("../utils/functions/verifyChannel");
const Match = require("../structures/database/match");
const User = require("../structures/database/User"); // <-- Importar o User

module.exports = {
  name: "rank",

  /**
   * @param {Message} message
   * @param {string[]} args
   * @param {BotClient} client
   */
  async execute(message, args, client) {
    const isAllowed = await Match.findById(message.channel.topic);

    if (
      message.channel.id !== "1342561854777720845" &&
      !isAllowed &&
      !message.member.permissions.has(PermissionFlagsBits.Administrator)
    )
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Você não pode usar este comando aqui.")
            .setDescription(
              `Vá pro canal <#1342561854777720845> e use o comando.`
            )
            .setTimestamp()
            .setColor(0xff0000),
        ],
      });

    await message.guild.members.fetch();

    const users = await User.find().sort({ points: -1 });
    const perPage = 10;
    let page = 0;

    if (users.length === 0)
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Sem usuários registrados!")
            .setTimestamp()
            .setDescription("Nenhum usuário deste servidor está registrado.")
            .setFooter({
              text: "Chame um ADM para o ajudar!",
            })
            .setColor(0xff0000),
        ],
      });

    const userRankPosition =
      users.findIndex((u) => u.player.id === message.author.id) + 1;
    const firstRankedId = users[0].player.id;
    const firstRanked =
      message.guild.members.cache.get(firstRankedId) ||
      message.guild.members.cache.get("1355544935662883100");

    const generateEmbed = async () => {
      const start = page * perPage;
      const paginatedUsers = users.slice(start, start + perPage);
      const returnedUser = await require("../utils/functions/returnUserRank")(
        message.author,
        message
      );

      const userStats = {
        Pontos: returnedUser.foundUser.points ?? 0,
        Posição: userRankPosition > 0 ? `${userRankPosition}` : "Não classificado",
      };

      return new EmbedBuilder()
        .setThumbnail(firstRanked?.user?.displayAvatarURL())
        .setTitle("Ranking de Vitórias")
        .setDescription(
          paginatedUsers
            .map(
              (user, index) =>
                `**${start + index + 1}° -** <@${user.player.id}>: ${
                  user.points ?? 0
                } pontos`
            )
            .join("\n") +
            `\n\n**Suas estatísticas:**\n**Pontos**: ${userStats.Pontos}\n**Posição**: ${userStats.Posição}`
        )
        .setFooter({ text: `Página ${page + 1}` });
    };

    const row = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("Voltar")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId("update_rank")
          .setLabel("⟳")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("Próxima")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled((page + 1) * perPage >= users.length)
      );

    const sentMessage = await message.reply({
      embeds: [await generateEmbed()],
      components: [row()],
    });

    const collector = sentMessage.createMessageComponentCollector({
      time: 120000,
    });

    collector.on("collect", async (btnInteraction) => {
      if (btnInteraction.user.id !== message.author.id)
        return btnInteraction.reply({ content: "Este botão não é para você.", ephemeral: true });

      if (btnInteraction.customId === "prev") page--;
      if (btnInteraction.customId === "next") page++;

      await btnInteraction.update({
        embeds: [await generateEmbed()],
        components: [row()],
      });
    });
  },
};
