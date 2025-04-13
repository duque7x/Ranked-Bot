const mongoose = require("./connection");

const userSchema = new mongoose.Schema({
    player: {
        name: String,
        id: String
    },
    points: {
        type: Number,
        default: 0
    },
    wins: {
        type: Number,
        default: 0
    },
    mvps: {
        type: Number,
        default: 0
    },
    losses: {
        type: Number,
        default: 0
    },
    gamesPlayed: {
        type: Array,
        default: []
    },
    blacklisted: {
        type: Boolean,
        default: false
    },
    protections: {
        type: [{
            type: {
                type: String,
                enums: ["point_protect", "immunity", "double_points"]
            },
            longevity: String, // now + when ends
            addedBy: String,
            when: {
                type: Date, // <-- salva com new Date()
                default: () => new Date()
            },
            expired: Boolean
        }],
        default: []
    },
    originalChannels: {
        type: [{
            channelId: String,
            matchId: String,
        }],
        default: []
    },
    adverts: {
        type: [
            {
                addedBy: String,
                addedWhen: String,
                reason: String,
            }
        ],
        default: []
    },
    dailyPoints: [{
        date: String, // format: YYYY-MM-DD
        points: Number,
    }]
});

// Static method to find or create a user
userSchema.statics.findOrCreate = async function (userId) {
    let user = await this.findOne({ "player.id": userId });
    if (!user) {
        user = await this.create({ player: { id: userId } });
    }
    return user;
};
userSchema.statics.toDefaults = async () => {
    const users = await User.find(); // Get all users

    for (let user of users) {
        // Loop through the schema paths and set missing fields to default
        Object.keys(userSchema.paths).forEach(path => {
            if (user[path] === undefined || user[path] === null) {
                const defaultValue = userSchema.paths[path].options.default;
                if (defaultValue !== undefined) {
                    user[path] = defaultValue;
                }
            }
        });

        // Save the document with the default values applied
        await user.save();
    }
}

const User = mongoose.model("User", userSchema);
module.exports = User;
