class Utils {
    static get errorMessages() {
        return require("./errorMessagesData");
    }

    static get addCredit() {
        return require("./_functions/addPoints");
    }
    
    static get addLoss() {
        return require("./_functions/addLoss");
    }
    
    static get addWin() {
        return require("./_functions/addWin");
    }
    
    static get createMatch() {
        return require("./_functions/createMatch");
    }
    
    static get createMatchChannel() {
        return require("./_functions/createMatchChannel");
    }
    
    static get removeCredit() {
        return require("./_functions/removePoints");
    }
    
    static get removeLoss() {
        return require("./_functions/removeLoss");
    }
    
    static get removeWin() {
        return require("./_functions/removeWin");
    }
    
    static get removeWinMatch() {
        return require("./_functions/removeWinMatch");
    }
    
    static get returnServerRank() {
        return require("./_functions/returnServerRank");
    }
    static get returnUserRank() {
        return require("./_functions/returnUserRank");
    }
    static get sendMatchEmbed() {
        return require("./_functions/sendMatchEmbed");
    }
    
    static get sendReply() {
        return require("./_functions/sendReply");
    }
    
    static get setMatchWinner() {
        return require("./_functions/setMatchWinner");
    }
    
    static get updateMembers() {
        return require("./_functions/updateMembers");
    }

    static get handlers() {
        return {
            btnWinner_handler: require("./_handlers/btnWinner_handler"),
            endMatch_handler: require("./_handlers/endMatch_handler"),
            entermatch_handler: require("./_handlers/enterMatch_handler"),
            handleMatchSelectMenu: require("./_handlers/handleMatchSelectMenu"),
            outmatch_handler: require("./_handlers/outmatch_handler"),
        };
    }
}

module.exports = Utils;
