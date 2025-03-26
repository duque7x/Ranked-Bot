const createBetChannel = require("./createMatchChannel");

module.exports = async (interaction, bet, client) => {
    if (bet.players.length !== 2) return require("./sendReply")(interaction, "# A aposta não está preenchida!");
    await require("./createMatch")(interaction, interaction.channel, bet.amount, bet.betType, true, interaction.user);

    const channel = await createBetChannel(interaction, bet);

    
    bet.betChannel = { id: channel.id, name: channel.name };
    bet.status = "started";
    bet.createdAt = Date.now();

    await bet.save();
    return channel;
}