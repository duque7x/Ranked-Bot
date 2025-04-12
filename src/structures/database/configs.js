const mongoose = require("./connection");

const configSchema = new mongoose.Schema({
    guild: {
        id: { type: String, required: true },
        name: { type: String }
    },
    state: {
        matches: {
            status: {
                type: String,
                enum: ["on", "off"],
                default: "on"
            }
        }
    },
    blacklist: {
        type: Array,
    },
    setupServerConfig: {
        matchesConfigs: {
            channel: {
                categoryId: String,
                allowedIds: {
                    defaultId: String,
                    otherIds: [String],
                },
            },
        },
        rankingConfigs: {
            channel: {
                categoryId: String,
                allowedIds: {
                    defaultId: String,
                    otherIds: [String],
                },
            },
        },
    },
    logsChannels: {
        ticketChannelId: String,
        generalLogsChannelId: String,
        matchesChannel: String
    },
    seasonRoleId: String,
    points: {
        win: Number,
        loss: Number,
        mvp: Number,
        creator: Number
    }
});

const Config = mongoose.model("config", configSchema);

module.exports = Config;