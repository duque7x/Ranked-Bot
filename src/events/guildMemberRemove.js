const { Events, EmbedBuilder, GuildMember, Colors } = require("discord.js");
const User = require("../structures/database/User");

module.exports = class {
    constructor(client) {
        this.name = "guildMemberRemove";
        this.client = client;
    }
    /**
     * 
     * @param {GuildMember} member - The member who joined the guild
     */
    async execute(member, client) {
        const userProfile = await User.findOne({ "player.id": member.id });

        if (!userProfile) return;

        if (userProfile.betsPlayed == 0) userProfile.deleteOne();
    }

};