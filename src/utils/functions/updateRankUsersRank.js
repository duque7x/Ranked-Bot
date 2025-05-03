const { Collection, GuildMember, PermissionFlagsBits } = require("discord.js");
const User = require("../../structures/database/User");

/**
 * @param {Collection<string, GuildMember>} members
 */
module.exports = async (members) => {
    const users = await User.find().sort({ points: -1 });
    try {

        for (const [, member] of members) {
            if (member.user.bot) continue;
            if (member.id == member.guild.ownerId) continue;

            const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);
            const hasRole = member.roles.cache.has("1350905290672963715");

            const nameBefore = member.displayName.includes("|")
                ? member.displayName.split("|")[1].trim()
                : member.displayName;

            //if (hasRole) {
            const userProfile = await User.findOrCreate(member.id);
            const { blacklisted } = userProfile;
            if (blacklisted) continue;

            const userRankPosition = users.findIndex(u => u.player.id === member.id) + 1;
            let finalName = `RANK ${userRankPosition} | ${nameBefore}`;
            if (finalName.length > 32) {
                const sliced = nameBefore.slice(0, 32 - `RANK ${userRankPosition} | `.length);
                finalName = `RANK ${userRankPosition} | ${sliced}`;
            }

            await member.setNickname(finalName);
            //}
        }
    } catch (error) {
        console.error(error);
    }
};
