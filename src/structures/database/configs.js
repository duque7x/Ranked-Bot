const mongoose = require("./connection");

const configSchema = new mongoose.Schema({
    guild: {
        id: { type: String, required: true },
        name: { type: String, required: true }
    },
    state: {
        bets: {
            status: {
                type: String,
                enum: ["on", "off"],
                default: "on"
            }
        },
        rank: {
            status: {
                type: String,
                enum: ["on", "off"],
                default: "on"
            }
        }
    }
});

const Config = mongoose.model("config", configSchema);

module.exports = Config;