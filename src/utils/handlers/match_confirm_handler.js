const Match = require("../../structures/database/match");
const addPoints = require("../functions/addPoints");
const {
  SlashCommandBuilder,
  EmbedBuilder,
  Colors,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  PermissionFlagsBits,
  StringSelectMenuInteraction,
  ButtonInteraction,
} = require("discord.js");
const addMvp = require("../functions/addMvp");
const setMatchWinner = require("../functions/setMatchWinner");
const setMatchLosers = require("../functions/setMatchLosers");
const endMatchFunction = require("../functions/endMatchFunction");
const User = require("../../structures/database/User");
const Config = require("../../structures/database/configs");
const updateRankUsersRank = require("../functions/updateRankUsersRank");
const returnMatchSelectMenu = require("../functions/returnMatchSelectMenu");
const setMatchMvp = require("../functions/setMatchMvp");
const setMatchCreator = require("../functions/setMatchCreator");

/**
 *
 * @param {ButtonInteraction} interaction
 */
module.exports = async function match_confirm_handler(interaction) {
  const config = await Config.findOrCreate(interaction.guildId);
  const { user, customId } = interaction;
  const [action, option, supposedUserId, matchId] = customId.split("-");
  const supposedUser = interaction.guild.members.cache.get(supposedUserId);
  const match = await Match.findOne({ _id: matchId });
  const userId = user.id;

  if (!match) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Partida offline")
          .setDescription("Esta partida não se encontra na base de dados")
          .setColor(0xff0000)
          .setTimestamp(),
      ],
      flags: 64,
    });
  }
  const leadersId = match.leaders.map((p) => p.id);
  const isAdmin = interaction.memberPermissions.has(PermissionFlagsBits.Administrator);
  if (!leadersId.some((id) => id === userId) && !isAdmin) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Você não pode confirmar nesta partida.")
          .setDescription(`<@${userId}> não és um dos capitões`)
          .setTimestamp()
          .setColor(0xff0000),
      ],
      flags: 64,
    });
  }

  const keys = {
    /**
     *
     * @param {ButtonInteraction} int
     */
    creator: async (int) => {
      const msg_btn = ButtonBuilder.from(
        int.message.components[0].components[0].data
      );
      let [confirmedCount, countLimit] = msg_btn.data.label
        .split(" ")[1]
        .replace(/\D/g, "")
        .split("")
        .map((p) => parseInt(p));
      const userAlreadyConfirmed = match.confirmed
        .filter((c) => c.typeConfirm === "creator")
        .some((p) => p.id == userId);
      const matchAlreadyConfirmed =
        match.confirmed.filter((c) => c.typeConfirm === "creator").length ==
        countLimit;

      if (isAdmin) {
        msg_btn.setLabel(`Confirmar [${confirmedCount}/${countLimit}]`);
        const row = new ActionRowBuilder().addComponents(returnMatchSelectMenu(match));

        await interaction.update({
          components: [row],
          embeds: [
            new EmbedBuilder()
              .setTitle("Criador definido")
              .setDescription(`${supposedUser.displayName} foi definido como criador da sala!`)
              .setFooter({ text: "Se isso foi um engano chame um dos ADMs" })
              .setTimestamp()
              .setColor(0x0097AE),
          ],
        });

        return setMatchCreator(match, interaction.guildId, supposedUserId);
        return;
      }

      if (matchAlreadyConfirmed) {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Esta opção já foi confirmada pelos capitões")
              .setColor(0xff0000)
              .setTimestamp(),
          ],
          flags: 64,
        });
        return;
      }
      if (userAlreadyConfirmed) {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Você já confirmou!")
              .setColor(0xff0000)
              .setTimestamp(),
          ],
          flags: 64,
        });
        return;
      }

      if (confirmedCount < countLimit) {
        ++confirmedCount;
        msg_btn.setLabel(`Confirmar [${confirmedCount}/${countLimit}]`);

        match.confirmed.push({
          id: String(userId),
          name: String(user.username),
          typeConfirm: String("creator"),
        });
        await match.save();

        await updateMessage(interaction, msg_btn, "", "", false);
      }
      if (confirmedCount >= countLimit) {
        msg_btn.setLabel(`Confirmar [${confirmedCount}/${countLimit}]`);
        const row = new ActionRowBuilder().addComponents(returnMatchSelectMenu(match));

        await interaction.update({
          components: [row],
          embeds: [
            new EmbedBuilder()
              .setTitle("Criador definido")
              .setDescription(`${supposedUser.displayName} foi definido como criador da sala!`)
              .setFooter({ text: "Se isso foi um engano chame um dos ADMs" })
              .setTimestamp()
              .setColor(0x0097AE),
          ],
        });

        setMatchCreator(match, interaction.guildId, supposedUserId);
        return;
      }
    },
    mvp: async (int) => {
      const msg_btn = ButtonBuilder.from(
        int.message.components[0].components[0].data
      );
      let [confirmedCount, countLimit] = msg_btn.data.label
        .split(" ")[1]
        .replace(/\D/g, "")
        .split("")
        .map((p) => parseInt(p));
      const userAlreadyConfirmed = match.confirmed
        .filter((c) => c.typeConfirm === "mvp")
        .some((p) => p.id == userId);
      const matchAlreadyConfirmed =
        match.confirmed.filter((c) => c.typeConfirm === "mvp").length ==
        countLimit;

      if (isAdmin) {
        msg_btn.setLabel(`Confirmar [${confirmedCount}/${countLimit}]`);

        const row = new ActionRowBuilder().addComponents(returnMatchSelectMenu(match));
        await interaction.update({
          components: [row],
          embeds: [
            new EmbedBuilder()
              .setTitle("MVP definido")
              .setDescription(`${supposedUser.displayName} foi definido como MVP da partida!`)
              .setFooter({ text: "Se isso foi um engano chame um dos ADMs" })
              .setTimestamp()
              .setColor(0x0097AE),
          ],
        });
        setMatchMvp(match, interaction.guildId, supposedUserId);
        return;
      }
      if (matchAlreadyConfirmed) {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Esta opção já foi confirmada pelos capitões")
              .setColor(0xff0000)
              .setTimestamp(),
          ],
          flags: 64,
        });
        return;
      }
      if (userAlreadyConfirmed) {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Você já confirmou!")
              .setColor(0xff0000)
              .setTimestamp(),
          ],
          flags: 64,
        });
        return;
      }

      if (confirmedCount < countLimit) {
        ++confirmedCount;
        msg_btn.setLabel(`Confirmar [${confirmedCount}/${countLimit}]`);

        match.confirmed.push({
          id: String(userId),
          name: String(user.username),
          typeConfirm: String("mvp"),
        });

        await match.save();
        return  await updateMessage(interaction, msg_btn, "", "", false);
      }
      if (confirmedCount >= countLimit) {
        msg_btn.setLabel(`Confirmar [${confirmedCount}/${countLimit}]`);
        const row = new ActionRowBuilder().addComponents(returnMatchSelectMenu(match));

        await interaction.update({
          components: [row],
          embeds: [
            new EmbedBuilder()
              .setTitle("MVP definido")
              .setDescription(`${supposedUser.displayName} foi definido como MVP da partida!`)
              .setFooter({ text: "Se isso foi um engano chame um dos ADMs" })
              .setTimestamp()
              .setColor(0x0097AE),
          ],
        });
        return setMatchMvp(match, interaction.guildId, supposedUserId);
      }
    },
    winner: async (int) => {
      const msg_btn = ButtonBuilder.from(
        int.message.components[0].components[0].data
      );
      let [confirmedCount, countLimit] = msg_btn.data.label
        .split(" ")[1]
        .replace(/\D/g, "")
        .split("")
        .map((p) => parseInt(p));
      if (isAdmin) {
        msg_btn.setLabel(`Confirmar [${confirmedCount}/${countLimit}]`);

        const winningTeam = supposedUserId;
        const losingTeam = winningTeam === "teamA" ? "teamB" : "teamA";

        await setMatchWinner(match, match[winningTeam], interaction.guildId);
        await setMatchLosers(match, match[losingTeam], interaction.guildId);

        const row = new ActionRowBuilder().addComponents(returnMatchSelectMenu(match));
        const winningTeamTag = `equipa ${winningTeam.split("team")[1] == "A" ? 1 : 2}`;

        const embed = new EmbedBuilder()
          .setTitle("Vencedores definidos!")
          .setDescription(`Vitória adicionada a **${winningTeamTag}**!`)
          .setColor(0xF5FF5A)
          .setTimestamp();

        return await interaction.update({ components: [row], embeds: [embed] });
      }
      if (match.winnerTeam.length !== 0) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Esta partida já tem vencedores!")
              .setColor(0xff0000)
              .setDescription("Tente novamente ou chame um dos nossos ADMs")
              .setTimestamp(),
          ],
        });
      }

      const userAlreadyConfirmed = match.confirmed
        .filter((c) => c.typeConfirm === "winner")
        .some((p) => p.id == userId);

      const matchAlreadyConfirmed =
        match.confirmed.filter((c) => c.typeConfirm === "winner").length ==
        countLimit;

      if (matchAlreadyConfirmed) {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Esta opção já foi confirmada pelos capitões")
              .setColor(0xff0000)
              .setTimestamp(),
          ],
          flags: 64,
        });
        return;
      }
      if (userAlreadyConfirmed) {
        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Você já confirmou!")
              .setColor(0xff0000)
              .setTimestamp(),
          ],
          flags: 64,
        });
        return;
      }

      if (confirmedCount < countLimit) {
        ++confirmedCount;
        msg_btn.setLabel(`Confirmar [${confirmedCount}/${countLimit}]`);

        match.confirmed.push({
          id: String(userId),
          name: String(user.username),
          typeConfirm: String("winner"),
        });

        await match.save();

        return await updateMessage(interaction, msg_btn, "Vencedor da fila");
      }
      if (confirmedCount >= countLimit) {
        msg_btn.setLabel(`Confirmar [${confirmedCount}/${countLimit}]`);

        const winningTeam = supposedUserId;
        const losingTeam = winningTeam === "teamA" ? "teamB" : "teamA";
        const msg = interaction.message;
        const row = new ActionRowBuilder().addComponents(returnMatchSelectMenu(match));

        await interaction.update({
          components: [row],
          embeds: [
            new EmbedBuilder()
              .setTitle("Vencedores definidos!")
              .setDescription(
                `Vitória adicionada ao **time ${winningTeam.split("team")[1] == "A" ? 1 : 2
                }**!`
              )
              .setColor(0xF5FF5A)
              .setTimestamp()
          ]
        });
        await setMatchWinner(match, match[winningTeam], interaction.guildId);
        await setMatchLosers(match, match[losingTeam], interaction.guildId);

        return;
      }
    },
  };

  if (keys[option]) await keys[option](interaction);

  if (option == "end_match") {
    if (isAdmin) {
      return await endMatchFunction(match, interaction);
    }
    const msg_btn = ButtonBuilder.from(
      interaction.message.components[0].components[0].data
    );
    let [confirmedCount, countLimit] = msg_btn.data.label
      .split(" ")[1]
      .replace(/\D/g, "")
      .split("")
      .map((p) => parseInt(p));
    const userAlreadyConfirmed = match.confirmed
      .filter((c) => c.typeConfirm === "end")
      .some((p) => p.id == userId);
    const matchAlreadyConfirmed =
      match.confirmed.filter((c) => c.typeConfirm === "end").length ==
      countLimit;

    if (matchAlreadyConfirmed) {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Esta opção já foi confirmada pelos capitões")
            .setColor(0xff0000)
            .setTimestamp(),
        ],
        flags: 64,
      });
      return;
    }
    if (userAlreadyConfirmed) {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Você já confirmou!")
            .setColor(0xff0000)
            .setTimestamp(),
        ],
        flags: 64,
      });
      return;
    }

    if (confirmedCount < countLimit) {
      ++confirmedCount;
      msg_btn.setLabel(`Confirmar [${confirmedCount}/${countLimit}]`);

      match.confirmed.push({
        id: String(userId),
        name: String(user.username),
        typeConfirm: String("end"),
      });

      await match.save();

      await updateMessage(interaction, msg_btn, "Encerrar");
    }
    if (confirmedCount >= countLimit) {
      return endMatchFunction(match, interaction);
    }
  }
  return await updateRankUsersRank(await interaction.guild.members.fetch());
};
/**
 *
 * @param {ButtonInteraction} interaction
 */
async function updateMessage(interaction, data, forName, title, reachedLimit) {
  const msg = interaction.message;
  const updatedButton = data;

  if (reachedLimit) {
    return interaction.message.edit({
      components: [],
      embeds: [
        new EmbedBuilder()
          .setTitle(title)
          .setDescription(forName)
          .setFooter({ text: "Se isso foi um engano chame um dos ADMs" })
          .setTimestamp()
          .setColor(0x0097AE),
      ],
    });
  }

  await interaction.message.edit({
    components: [new ActionRowBuilder().setComponents(updatedButton)],
  });
  await interaction.deferUpdate();
  return;
}
