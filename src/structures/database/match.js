const mongoose = require("./connection");

const matchSchema = new mongoose.Schema({
  players: {
    type: [{ id: String, name: String, joinedAt: Date }],
    default: [{ id: "", name: "String", joinedAt: Date }],
  }, // Array of mixed types
  createdAt: { type: Date, default: Date.now }, // Default should be Date.now (not a function call)
  matchChannel: { type: { id: String, name: String } },
  voiceChannels: { type: [{ id: String, name: String }] },
  matchType: {
    type: String,
    default: "1x1",
    enum: ["1x1", "2x2", "3x3", "4x4", "5x5", "6x6", "1v1", "2v2", "3v3", "4v4", "5v5", "6v6"],
  }, // Single string, not an array
  status: {
    type: String,
    default: "on",
    enum: ["off", "created", "on", "shutted"],
  }, // Single string, default to "on"
  winnerTeam: { type: Array }, // Single strin
  maximumSize: { type: Number, default: 4 }, // Single strin
  creatorId: {
    type: String,
    default: "00000000000000000",
  },
  kickedOut: { type: [{ id: String, name: String }], default: [] },
  teamA: { type: [{ id: String, name: String }], default: [] },
  teamB: { type: [{ id: String, name: String }], default: [] },
  losers: { type: [{ id: String, name: String }], default: [] },
  leaders: { type: [{ id: String, name: String }], default: [] },
  roomCreator: { id: String, name: String },
  confirmed: {
    type: [{ id: String, name: String, typeConfirm: String }],
    default: [],
  },
  mvp: { type: [{ id: String, name: String }], default: [] },
  adverts: {
    type: [{ id: String, name: String }],
  },
});

const Match = mongoose.model("Match", matchSchema);

matchSchema.statics.toDefaults = async () => {
  const matches = await Match.find(); // Get all matches

  for (let match of matches) {
    // Loop through the schema paths and set missing fields to default
    Object.keys(matchSchema.paths).forEach((path) => {
      if (match[path] === undefined || match[path] === null) {
        const defaultValue = matchSchema.paths[path].options.default;
        if (defaultValue !== undefined) {
          match[path] = defaultValue;
        }
      }
    });

    // Save the document with the default values applied
    await match.save();
  }
};
module.exports = Match;
