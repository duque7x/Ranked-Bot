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
            
            const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);
            const hasRole = member.roles.cache.has("1350144276834680912");
            const nameBefore = member.displayName.includes("|")
                ? member.displayName.split("|")[1].trim()
                : member.displayName;

            if (hasRole && !isAdmin) {
                const userProfile = await User.findOrCreate(member.id);
                const isBlacklisted = userProfile.blacklisted;
                if (isBlacklisted) continue;

                const userRankPosition = users.findIndex(u => u.player.id === member.id) + 1;

                let finalName = `RANK ${userRankPosition} | ${nameBefore}`;
                if (finalName.length > 32) {
                    const sliced = nameBefore.slice(0, 32 - `RANK ${userRankPosition} | `.length);
                    finalName = `RANK ${userRankPosition} | ${sliced}`;
                }
                await member.setNickname(finalName);
            }
            if (!hasRole && !isAdmin) {
                const name = member.displayName.includes("|")
                    ? member.displayName.split("|")[1].trim()
                    : member.displayName;

                if (member.displayName !== nameBefore) await member.setNickname(name);
                await User.deleteOne({ "player.id": member.id });
            }
        }
    } catch (err) {
        console.error(`❌ Failed to set nickname.`, err.message);
    }
};
