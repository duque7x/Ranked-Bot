module.exports = async (interaction, channel, amount) => {
    try {
        const betType = channel.name.split("・")[1];

        const newBet = new Bet({
            betType,
            amount,
            betChannel: { id: channel.id, name: channel.name },
            status: "on"
        });

        await newBet.save();
        await this.sendBetEmbed(interaction, betType, newBet, amount, channel);
    } catch (err) {
        console.error(`Erro ao criar aposta no canal ${channel.name}:`, err);
    }
}