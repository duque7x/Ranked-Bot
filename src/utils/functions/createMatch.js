const { EmbedBuilder, Colors, PermissionFlagsBits } = require("discord.js");
const Match = require("../../structures/database/match");
const sendReply = require("./sendReply");
const User = require("../../structures/database/User");

module.exports = async (interaction, channel, matchType, sendOrNot, user) => {
  try {
    const isInVoice = !!interaction.member.voice.channel;
    const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

    if (!isInVoice && !isAdmin) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Canal de voz")
            .setDescription("Você tem que estar conectado a um canal de voz ou ser administrador para criar uma fila!")
            .setColor(0xff0000)
            .setTimestamp(),
        ],
        flags: 64,
      });
    }
    const userId = user.id;
    let activeMatchs = await Match.find({
      players: { $elemMatch: { id: userId } },
    });
    let ongoingMatchs = activeMatchs.filter((b) => b.status !== "off" && b.status !== "shutted").sort((a, b) => b.createdAt - a.createdAt);

    if (ongoingMatchs.length > 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Você já está em outra partida")
            .setDescription(`Canal: <#${ongoingMatchs[0].matchChannel.id}>\n-# Chame um ADM se esta tendo problemas.`)
            .setTimestamp()
            .setColor(0xff0000)
        ],
        flags: 64
      });
    }
    // Determine max team size
    const maximumSize = 2 * Number(matchType.replace(/[a-zA-Z]/g, "").at(0));

    // Create the match
    const match = new Match({
      maximumSize,
      matchChannel: { id: channel.id, name: channel.name },
      matchType,
      status: "created",
      players: [{ id: userId, name: user.username, joinedAt: Date.now() }],
      teamA: [{ id: userId, name: user.username, joinedAt: Date.now() }],
      creatorId: userId,
    });

    await match.save();

    // Send embed if required
    if (sendOrNot === true) {
      await require("./sendMatchEmbed")(interaction, match);
    }

    return match;
  } catch (err) {
    console.error(`Erro ao criar partida no canal ${channel.name}:`, err);
  }
};
