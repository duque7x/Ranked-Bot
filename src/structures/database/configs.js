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
            channels: {
                categoryId: String,
                allowedIds: {
                    defaultId: String,
                    otherIds: [String],
                },
            },
        },
        rankingConfigs: {
            channels: {
                categoryId: String,
                allowedIds: {
                    defaultId: String,
                    otherIds: [String],
                },
            },
        },
        seasonRoleId: String,

    },
    points: {
        win: Number,
        loss: Number,
        mvp: Number,
        creator: Number
    }
});

configSchema.statics.findOrCreate = async function (guildId) {
    let guild = await this.findOne({ "guild.id": guildId });
    if (!guild) {
        guild = await new Config({ guild: { id: guildId } });
    }
    return guild;
};
const Config = mongoose.model("config", configSchema);

module.exports = Config