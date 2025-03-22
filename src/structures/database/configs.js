const mongoose = require("./connection");

const configSchema = new mongoose.Schema({
    guild: {
        id: { type: String, required: true },
        name: { type: String}
    },
    state: {
        matchs: {
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
    },
    blacklist: {
        type: Array,
    }
});

const Config = mongoose.model("config", configSchema);

module.exports = Config;