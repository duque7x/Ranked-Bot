const createBetChannel = require("./createBetChannel");

module.exports = async (interaction, bet, client) => {
    if (bet.players.length !== 2) return require("./sendReply")(interaction, "# A aposta não está preenchida!");

    const channel = await createBetChannel(interaction, bet);

    await require("./createBet")(interaction, interaction.channel, bet.amount, bet.betType, true);

    bet.betChannel = { id: channel.id, name: channel.name };
    bet.status = "started";
    bet.createdAt = Date.now();

    await bet.save();
    return channel;
}