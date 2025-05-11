const mongoose = require("./connection");

const matchSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  players: {
    type: [{ id: String, name: String, joinedAt: Date }],
    default: [{ id: "", name: "String", joinedAt: Date }],
  },
  textChannel: { type: { id: String, name: String } },
  voiceChannels: { type: [{ id: String, name: String }] },
  type: {
    type: String,
    default: "1x1",
    enum: ["1x1", "2x2", "3x3", "4x4", "5x5", "6x6", "1v1", "2v2", "3v3", "4v4", "5v5", "6v6"],
  },
  status: {
    type: String,
    default: "on",
    enum: ["off", "created", "on", "shutted"],
  },

  winner: String,
  losers: String,

  maximumSize: { type: Number, default: 4 },
  kickedOut: { type: [{ id: String, name: String }], default: [] },
  teamA: { type: [{ id: String, name: String }], default: [] },
  teamB: { type: [{ id: String, name: String }], default: [] },

  confirmed: {
    type: [{ id: String, name: String, typeConfirm: String, setted: Boolean }],
    default: [],
  },

  leaders: { type: [{ id: String, name: String }], default: [] },
  mvpId: String,
  creatorId: String,
  roomCreatorId: String,
});
const Match = mongoose.model("Match", matchSchema);

matchSchema.statics.toDefaults = async () => {
  const matches = await Match.find();
  for (let match of matches) {
    Object.keys(matchSchema.paths).forEach((path) => {
      if (match[path] === undefined || match[path] === null) {
        const defaultValue = matchSchema.paths[path].options.default;
        if (defaultValue !== undefined) match[path] = defaultValue;
        else match[path] = undefined;
      }
    });
    await match.save();
  }
};

module.exports = Match;
