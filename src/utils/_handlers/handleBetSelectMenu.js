const Bet = require("../../structures/database/bet");
const sendReply = require("../_functions/sendReply");
const { errorMessages } = require("../utils");

module.exports = async function betSelectMenu_handler(interaction, betId, client) {
    const value = interaction.values[0];
    const handler = {
        start_bet_value: require("../_functions/startBet").bind(this),
        go_back: goBack
    };

    let bet = await Bet.findById(betId);
    if (!bet || bet.status === "off") return sendReply(interaction, errorMessages.bet_off);
    if (bet.status === "started") return sendReply(interaction, errorMessages.bet_started);
    if (handler[value]) return await handler[value](interaction, bet, client);
}

function goBack(interaction) {
    return sendReply(interaction, "# ...")
}