const User = require("../../structures/database/User");
const { PermissionFlagsBits } = require("discord.js");

module.exports = async (members) => {
    // Loop through each member
    const updates = [];

    for (const member of members.values()) {
        const userExists = await User.exists({ "player.id": member.id });

        if (!userExists) {
            // Prepare the update operation for users that don't exist in the database
            updates.push(
                User.findOneAndUpdate(
                    { "player.id": member.id },
                    {
                        $set: {
                            "player.name": member.user.username,
                            "player.id": member.user.id,
                            isAdmin: member.permissions.has(PermissionFlagsBits.Administrator)
                        }
                    },
                    { new: true, upsert: true }
                )
            );
        }
    }

    // Execute all the update operations in parallel
    await Promise.all(updates);
}