const Bet = require("../../structures/database/bet");

module.exports = async (interaction, channel, amount, betType, sendOrNot) => {
    try {
        const newBet = new Bet({
            betType,
            amount,
            betChannel: { id: channel.id, name: channel.name },
            status: "on"
        });

        await newBet.save();
        
        if (sendOrNot == true) {
            await require("./sendBetEmbed")(interaction, newBet, channel);
        }

        return newBet;
    } catch (err) {
        console.error(`Erro ao criar aposta no canal ${channel.name}:`, err);
    }
}