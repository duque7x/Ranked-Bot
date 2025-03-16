const Bet = require("../../structures/database/bet");

module.exports = async (interaction, channel, amount, betType) => {
    try {
        const newBet = new Bet({
            betType,
            amount,
            betChannel: { id: channel.id, name: channel.name },
            status: "on"
        });

        await newBet.save();
        await require("./sendBetEmbed")(interaction, newBet, channel);

        return newBet;
    } catch (err) {
        console.error(`Erro ao criar aposta no canal ${channel.name}:`, err);
    }
}