const btnWinner_handler = require("./_handlers/btnWinner_handler");
const endBet_handler = require("./_handlers/endBet_handler");
const enterbet_handler = require("./_handlers/enterbet_handler");
const handleBetSelectMenu = require("./_handlers/handleBetSelectMenu");
const outbet_handler = require("./_handlers/outbet_handler");
const setWinner_handler = require("./_handlers/setWinner_handler");

module.exports = {
    errorMessages: {
        'bet_off': "# Essa aposta foi fechada!\n-# Aguarde antes de tentar novamente.",
        'bet_started': "# A aposta já foi iniciada.\n-# Aguarde a conclusão antes de tentar novamente.",
        'bet_won': "# Esta aposta já tem um ganhador!\n-# Foi um engano?\n-# Chame um ADM para o ajudar. **MANDE PROVAS!**",
        'blacklist': "# Você está na *blacklist*!\n-# Deseja **sair**? Abra um ticket <#1339284682902339594>",
        'bet_in': "# Você já está na aposta...",
        'bet_full': "# A aposta já está cheia!",
        'bet_not_full': "# A aposta não está preenchida!",
        'bet_not_in': "# Você não se encontra nesta aposta!",
        'bet_no_winner': "# Vocês precisam definir o vencedor!",
        'bets_off': "# As apostas estão fechadas no momento!\n-# Aguarde antes de tentar novamente.",
    },
    addCredit: require("./_functions/addCredit"),
    addLoss: require("./_functions/addLoss"),
    addLossWithAmount: require("./_functions/addLossWithAmount"),
    addWin: require("./_functions/addWin"),
    createBet: require("./_functions/createBet"),
    createBetChannel: require("./_functions/createBetChannel"),
    removeCredit: require("./_functions/removeCredit"),
    removeLoss: require("./_functions/removeLoss"),
    removeWin: require("./_functions/removeWin"),
    removeWinBet: require("./_functions/removeWinBet"),
    returnServerRank: require("./_functions/returnServerRank"),
    sendBetEmbed: require("./_functions/sendBetEmbed"),
    sendReply: require("./_functions/sendReply"),
    setBetWinner: require("./_functions/setBetWinner"),
    updateMembers: require("./_functions/updateMembers"),
    handlers: {
        btnWinner_handler,
        endBet_handler,
        enterbet_handler,
        handleBetSelectMenu,
        outbet_handler,
        setWinner_handler
    }
}