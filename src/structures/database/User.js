const mongoose = require("./connection");

const userSchema = new mongoose.Schema({
    player: { name: mongoose.SchemaTypes.String, id: mongoose.SchemaTypes.String },
    wins: { type: mongoose.SchemaTypes.Number, default: 0 }
});

const User = mongoose.model("User", userSchema);

module.exports = User;

// status: off, on, started