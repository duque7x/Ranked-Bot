const mongoose = require("./connection");

const betSchema = new mongoose.Schema({
    players: { type: [mongoose.Schema.Types.Mixed], default: [] }, // Array of any type
    createdAt: { type: Date, default: Date.now }, // Fix default Date.now()
    betChannel: { type: mongoose.Schema.Types.Mixed }, // More robust type
    betType: { type: [mongoose.Schema.Types.String], default: "" },
    status: { type: [mongoose.Schema.Types.String], default: "on" },
    amount: { type: [mongoose.Schema.Types.String], default: "1" },
    winner: { type: mongoose.Schema.Types.String },
    payed: String,
});

const Bet = mongoose.model("Bet", betSchema);

module.exports = Bet;

// status: off, on, started