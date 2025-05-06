const { EmbedBuilder, Colors, PermissionFlagsBits } = require("discord.js");
const Match = require("../../structures/database/match");
const sendChallengeMatchEmbed = require("./sendChallengeMatchEmbed");

module.exports = async (interaction, channel, matchType, sendOrNot, user) => {
  try {
    const userId = user.id;

    let [activeMatchs] = await Promise.all([
      await Match.find({ "players": { $elemMatch: { id: userId } } }),
    ]);

    let ongoingMatchs = activeMatchs.filter(b => b.status !== "off" && b.status !== "shutted").sort((a, b) => b.createdAt - a.createdAt);

    if (ongoingMatchs.length > 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Você já está em outra partida")
            .setDescription(`Canal: <#${ongoingMatchs[0].matchChannel.id}>\n-# Id da fila: ${ongoingMatchs[0]._id}`)
            .setTimestamp()
            .setColor(0xff0000)
        ],
        flags: 64
      });
    }
    const maximumSize = 2 * Number(matchType.replace(/[a-zA-Z]/g, "").at(0));
    
    const match = new Match({
      maximumSize,
      matchChannel: { id: channel.id, name: channel.name },
      matchType,
      status: "created",
      players: [{ id: userId, name: user.username, joinedAt: Date.now() }],
      teamA: [{ id: userId, name: user.username, joinedAt: Date.now() }],
      creatorId: userId,
    });

    // Send embed if required
    if (sendOrNot === true) {
      await sendChallengeMatchEmbed(interaction, match);
    }

    return await match.save();;
  } catch (err) {
    console.error(`Erro ao criar partida no canal ${channel.name}:`, err);
  }
};
