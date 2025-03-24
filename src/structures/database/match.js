const mongoose = require("./connection");

const matchSchema = new mongoose.Schema({
    players: { type: [{ id: String, name: String, joinedAt: Date }], default: [{ id: "", name: "String", joinedAt: Date }] }, // Array of mixed types
    createdAt: { type: Date, default: Date.now }, // Default should be Date.now (not a function call)
    matchChannel: { type: { id: String, name: String } },
    voiceChannels: { type: [{ id: String, name: String }] },
    matchType: { type: String, default: "1x1", enum: ["1x1", "2x2", "3x3", "4x4", "5x5", "6x6"] }, // Single string, not an array
    status: { type: String, default: "on", enum: ["off", "created", "on", "shutted"] }, // Single string, default to "on"
    winnerTeam: { type: Array }, // Single strin
    maximumSize: { type: Number, default: 2 }, // Single strin
    creatorId: {
        type: String,
        default: "00000000000000000"
    },
    teamA: { type: [{ id: String, name: String }], default: [] },
    teamB: { type: [{ id: String, name: String }], default: [] },
    losers: { type: [{ id: String, name: String }], default: [] },
    leaders: { type: [{ id: String, name: String }], default: []  }
});

const Match = mongoose.model("Match", matchSchema);

module.exports = Match;
