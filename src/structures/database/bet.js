const mongoose = require("./connection");

const betSchema = new mongoose.Schema({
    players: { type: Array, default: [] }, // Array of mixed types
    createdAt: { type: Date, default: Date.now }, // Default should be Date.now (not a function call)
    betChannel: { type: Object }, // Assuming it's a Discord channel ID
    betType: { type: String, default: "4x4" }, // Single string, not an array
    status: { type: String, default: "on" }, // Single string, default to "on"
    amount: { type: Number, default: 1 }, // Single string, default to "1"
    winner: { type: String }, // Single string
    payed: { type: Boolean }, // Consistent type definition
});

const Bet = mongoose.model("Bet", betSchema);

module.exports = Bet;
