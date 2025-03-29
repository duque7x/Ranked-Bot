const path = require("path");
class Utils {
    static get errorMessages() {
        return require("./errorMessagesData");
    }

    static get addCredit() {
        return require("./functions/addPoints");
    }
    
    static get addLoss() {
        return require("./functions/addLoss");
    }
    
    static get addWin() {
        return require("./functions/addWin");
    }
    
    static get createMatch() {
        return require("./functions/createMatch");
    }
    
    static get createMatchChannel() {
        return require("./functions/createMatchChannel");
    }
    
    static get removeCredit() {
        return require("./functions/removePoints");
    }
    
    static get removeLoss() {
        return require("./functions/removeLoss");
    }
    
    static get removeWin() {
        return require("./functions/removeWin");
    }
    
    static get removeWinMatch() {
        return require("./functions/removeWinMatch");
    }
    
    static get returnServerRank() {
        return require("./functions/returnServerRank");
    }
    static get returnUserRank() {
        return require("./functions/returnUserRank");
    }
    static get sendMatchEmbed() {
        return require("./functions/sendMatchEmbed");
    }
    
    static get sendReply() {
        return require("./functions/sendReply");
    }
    
    static get setMatchWinner() {
        return require("./functions/setMatchWinner");
    }
    
    static get updateMembers() {
        return require("./functions/updateMembers");
    }

    static get handlers() {
        return {
            btnWinner_handler: require("./handlers/btnWinner_handler"),
            endMatch_handler: require("./handlers/endMatch_handler"),
            entermatch_handler: require(path.join(__dirname, "_handlers/enterMatch_handler")),
            handleMatchSelectMenu: require("./handlers/handleMatchSelectMenu"),
            outmatch_handler: require("./handlers/outmatch_handler"),
        };
    }
}

module.exports = Utils;
