const mongoose = require("./connection");

const userSchema = new mongoose.Schema({
    player: {
        name: String,
        id: String
    },
    wins: {
        type: Number,
        default: 0
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    adminPoints: {
        type: Number,
        default: 0
    },
});

const User = mongoose.model("User", userSchema);

module.exports = User;

// status: off, on, started