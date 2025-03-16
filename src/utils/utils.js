class Utils {
    static get errorMessages() {
        return require("./errorMessagesData");
    }

    static get addCredit() {
        return require("./_functions/addCredit");
    }
    
    static get addLoss() {
        return require("./_functions/addLoss");
    }
    
    static get addLossWithAmount() {
        return require("./_functions/addLossWithAmount");
    }
    
    static get addWin() {
        return require("./_functions/addWin");
    }
    
    static get createBet() {
        return require("./_functions/createBet");
    }
    
    static get createBetChannel() {
        return require("./_functions/createBetChannel");
    }
    
    static get removeCredit() {
        return require("./_functions/removeCredit");
    }
    
    static get removeLoss() {
        return require("./_functions/removeLoss");
    }
    
    static get removeWin() {
        return require("./_functions/removeWin");
    }
    
    static get removeWinBet() {
        return require("./_functions/removeWinBet");
    }
    
    static get returnServerRank() {
        return require("./_functions/returnServerRank");
    }
    
    static get sendBetEmbed() {
        return require("./_functions/sendBetEmbed");
    }
    
    static get sendReply() {
        return require("./_functions/sendReply");
    }
    
    static get setBetWinner() {
        return require("./_functions/setBetWinner");
    }
    
    static get updateMembers() {
        return require("./_functions/updateMembers");
    }

    static get handlers() {
        return {
            btnWinner_handler: require("./_handlers/btnWinner_handler"),
            endBet_handler: require("./_handlers/endBet_handler"),
            enterbet_handler: require("./_handlers/enterbet_handler"),
            handleBetSelectMenu: require("./_handlers/handleBetSelectMenu"),
            outbet_handler: require("./_handlers/outbet_handler"),
            setWinner_handler: require("./_handlers/setWinner_handler"),
        };
    }
}

module.exports = Utils;
