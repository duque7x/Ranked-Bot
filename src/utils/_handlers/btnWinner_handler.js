const Bet = require("../../structures/database/bet");
const sendReply = require("../_functions/sendReply");
const addLossWithAmount = require("../_functions/addLossWithAmount");
const setBetWinner = require("../_functions/setBetWinner");
const { EmbedBuilder, Colors } = require("discord.js");
const errorMessages = require("../utils").errorMessages;

module.exports = async function btnWinner(interaction) {
    const { customId, guild, channel } = interaction;
    const [action, betId, winningPlayerId, losingPlayerId] = customId.split("-");

    // Buscar aposta no banco de dados
    const bet = await Bet.findOne({ _id: betId });
    if (!bet) return sendReply(interaction, "Aposta não encontrada.");

    // Verificar se a aposta já tem um vencedor
   if (bet.winner) return sendReply(interaction, errorMessages.bet_won + `\nId: **${betId}**`);

    // Buscar membros no cache
    const winningMember = guild.members.cache.get(winningPlayerId);
    const losingMember = guild.members.cache.get(losingPlayerId);

    if (!winningMember || !losingMember) {
        return sendReply(interaction, "Um dos jogadores não foi encontrado no servidor.");
    }

    // Adicionar derrota e definir vencedor
    const loserProfile = await addLossWithAmount(losingPlayerId, interaction, bet);
    const { userProfile: winnerProfile } = await setBetWinner(bet, winningMember);

    // Garantir que a aposta esteja registrada no histórico do jogador
    if (!loserProfile.betsPlayed.includes(bet._id)) loserProfile.betsPlayed.push(bet._id);
    if (!winnerProfile.betsPlayed.includes(bet._id)) winnerProfile.betsPlayed.push(bet._id);

    await loserProfile.save();
    await winnerProfile.save();

    // Criar embeds de logs
    const logEmbed = new EmbedBuilder()
        .setDescription(`# Gerenciador de crédito\nCrédito de **${bet.amount}€** foi adicionado a <@${winningPlayerId}>!`)
        .setColor(Colors.DarkButNotBlack)
        .setTimestamp()
        .addFields(
            { name: "ID da aposta:", value: bet?._id?.toString() ?? "ID inválido" },
            { name: "Valor ganho", value: `${bet.amount}€` },
            { name: "Canal da aposta", value: bet?.betChannel?.id ? `<#${bet.betChannel.id}>` : "Canal inválido" }
        );

    const winnerEmbed = new EmbedBuilder()
        .setDescription(`# Ganhador da aposta!\n-# Vitória adicionada a <@${winningPlayerId}>!\nAgora com **${winnerProfile.wins + 1}** vitória(s)`)
        .setColor(0x00ff00)
        .setThumbnail(winningMember.user.displayAvatarURL({ dynamic: true, size: 512, format: "png" }))
        .setTimestamp();

    // Canal de log da vitória
    const winLogChannel = guild.channels.cache.get("1339329876662030346") || channel;
    await winLogChannel.send({ embeds: [logEmbed] });

    // Responder a interação corretamente
    if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [winnerEmbed] }).catch(console.error);
    } else {
        await interaction.reply({ embeds: [winnerEmbed] }).catch(console.error);
    }
};
