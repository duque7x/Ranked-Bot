const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors } = require("discord.js");
const { setMatchWinner, setMatchLosers, endMatchFunction } = require("../../../structures/database/match");

module.exports = async (interaction, match, option) => {
  const keys = {
    mvp: async (interaction) => {
      const userId = interaction.user.id;
      const msg_btn = ButtonBuilder.from(interaction.message.components[0].components[0]);
      const currentEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
      const confirmedIds = match.confirmations.mvp?.users || [];
      const confirmedCount = confirmedIds.length;
      const requiredCount = 2;

      if (confirmedIds.includes(userId)) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Já confirmaste!")
              .setDescription("Tu já confirmaste o MVP desta partida.")
              .setColor(Colors.Red)
              .setTimestamp(),
          ],
          flags: 64,
        });
      }

      match.confirmations.mvp = {
        type: "mvp",
        user: match.mvp,
        users: [...confirmedIds, userId],
      };

      msg_btn.setLabel(`MVP (${match.confirmations.mvp.users.length}/2)`);

      await match.save();
      await updateMessage(interaction, msg_btn, "", "", false);

      if (confirmedCount + 1 >= requiredCount) {
        const embed = new EmbedBuilder()
          .setTitle("MVP da partida")
          .setDescription(`O MVP foi confirmado como <@${match.mvp}>!`)
          .setColor(Colors.Green)
          .setTimestamp();

        await interaction.message.edit({ components: [], embeds: [embed] });
      }
    },

    creator: async (interaction) => {
      const userId = interaction.user.id;
      const msg_btn = ButtonBuilder.from(interaction.message.components[0].components[0]);
      const confirmedIds = match.confirmations.creator?.users || [];
      const requiredCount = 2;

      if (confirmedIds.includes(userId)) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Já confirmaste!")
              .setDescription("Tu já confirmaste quem criou a sala.")
              .setColor(Colors.Red)
              .setTimestamp(),
          ],
          flags: 64,
        });
      }

      match.confirmations.creator = {
        type: "creator",
        user: match.creator,
        users: [...confirmedIds, userId],
      };

      msg_btn.setLabel(`Criador (${match.confirmations.creator.users.length}/2)`);

      await match.save();
      await updateMessage(interaction, msg_btn, "", "", false);

      if (match.confirmations.creator.users.length >= requiredCount) {
        const embed = new EmbedBuilder()
          .setTitle("Criador da sala")
          .setDescription(`Criador confirmado como <@${match.creator}>`)
          .setColor(Colors.Green)
          .setTimestamp();

        await interaction.message.edit({ components: [], embeds: [embed] });
      }
    },

    winner: async (interaction) => {
      const userId = interaction.user.id;
      const msg_btn = ButtonBuilder.from(interaction.message.components[0].components[0]);
      const supposedUserId = interaction.customId.split("_")[2];
      const confirmed = match.confirmations.winner?.users || [];
      const countLimit = 3;

      if (confirmed.includes(userId)) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Já confirmaste!")
              .setDescription("Tu já confirmaste o vencedor.")
              .setColor(Colors.Red)
              .setTimestamp(),
          ],
          flags: 64,
        });
      }

      if (!["teamA", "teamB"].includes(supposedUserId)) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Opção inválida")
              .setDescription("O time indicado não é válido.")
              .setColor(Colors.Red)
              .setTimestamp(),
          ],
          flags: 64,
        });
      }

      match.confirmations.winner = {
        type: "winner",
        user: supposedUserId,
        users: [...confirmed, userId],
      };

      msg_btn.setLabel(`Vitória (${match.confirmations.winner.users.length}/3)`);
      await match.save();
      await updateMessage(interaction, msg_btn, "", "", false);

      if (match.confirmations.winner.users.length >= countLimit) {
        const winningTeam = supposedUserId;
        const losingTeam = winningTeam === "teamA" ? "teamB" : "teamA";

        await setMatchWinner(match, match[winningTeam], interaction.guildId);
        await setMatchLosers(match, match[losingTeam], interaction.guildId);
        await endMatchFunction(match);

        const embed = new EmbedBuilder()
          .setTitle("Ganhador(es) da partida")
          .setDescription(`Vitória confirmada para o **time ${winningTeam === "teamA" ? "1" : "2"}**!`)
          .setColor(Colors.Green)
          .setTimestamp();

        await interaction.message.edit({ components: [], embeds: [embed] });
      }
    },
  };

  if (keys[option]) {
    try {
      await keys[option](interaction);
    } catch (error) {
      console.error(error);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Erro")
            .setDescription("Houve um erro ao processar a confirmação.")
            .setColor(Colors.Red)
            .setTimestamp(),
        ],
        flags: 64,
      });
    }
  } else {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Opção inválida")
          .setDescription("Essa opção de confirmação não é válida.")
          .setColor(Colors.Red)
          .setTimestamp(),
      ],
      flags: 64,
    });
  }
};

async function updateMessage(interaction, button, description, title, clearButtons) {
  const embed = EmbedBuilder.from(interaction.message.embeds[0]);

  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);

  const row = new ActionRowBuilder().addComponents(button);

  await interaction.update({
    embeds: [embed],
    components: clearButtons ? [] : [row],
  });
}
