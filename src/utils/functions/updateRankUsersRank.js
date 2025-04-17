const { Collection, GuildMember, PermissionFlagsBits } = require("discord.js");
const User = require("../../structures/database/User");

/**
 * @param {Collection<string, GuildMember>} members
 */
module.exports = async (members) => {
    const users = await User.find().sort({ points: -1 });

    for (const [, member] of members) {
        if (member.user.bot) continue;

        const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);
        const hasRole = member.roles.cache.has("1350144276834680912");

        const nameBefore = member.displayName.includes("|")
            ? member.displayName.split("|")[1].trim()
            : member.displayName;

        if (hasRole && !isAdmin) {
            const userProfile = await User.findOrCreate(member.id);
            const { points, blacklisted } = userProfile;
            if (blacklisted) return;

            const userRankPosition = users.findIndex(u => u.player.id === member.id) + 1;
            let finalName = `RANK ${userRankPosition} | ${nameBefore}`;
            if (finalName.length > 32) {
                const sliced = nameBefore.slice(0, 32 - `RANK ${userRankPosition} | `.length);
                finalName = `RANK ${userRankPosition} | ${sliced}`;
            }

            member.setNickname(finalName).catch(() => { });

            const rankRoles = {
                18500: "1362074164940505219",
                28500: "1362073766942871643",
                35000: "1362073548658577458",
                45000: "1362073334170386715"
            };

            const thresholds = Object.keys(rankRoles).map(Number).sort((a, b) => b - a);
            let roleToAdd = null;

            for (const threshold of thresholds) {
                if (points >= threshold) {
                    roleToAdd = rankRoles[threshold];
                    break;
                }
            }

            if (roleToAdd) {
                const allRankRoles = Object.values(rankRoles).filter(r => r !== roleToAdd);
                member.roles.remove(allRankRoles).catch(() => { });
                member.roles.add(roleToAdd).catch(() => { });
            }
        }

        if (!hasRole && !isAdmin) {
            User.deleteOne({ "player.id": member.id }).catch(() => { });
        }
    }
};
