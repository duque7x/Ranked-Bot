const mongoose = require("./connection");

const userSchema = new mongoose.Schema({
    player: {
        name: String,
        id: String
    },
    points: {
        type: Number,
        default: 0
    },
    wins: {
        type: Number,
        default: 0
    },
    losses: {
        type: Number,
        default: 0
    },
    gamesPlayed: {
        type: Array,
        default: []
    },
    blacklisted: {
        type: Boolean,
        default: false
    },
});

const User = mongoose.model("User", userSchema);

module.exports = User;

// status: off, on, started