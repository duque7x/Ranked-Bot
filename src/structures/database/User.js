const mongoose = require("./connection");

const userSchema = new mongoose.Schema({
    player: {
        name: String,
        id: String
    },
    credit: {
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
    blacklisted: Boolean
});

const User = mongoose.model("User", userSchema);

module.exports = User;

// status: off, on, started