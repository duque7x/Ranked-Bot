const Config = require("../../structures/database/configs");
const User = require("../../structures/database/User");

module.exports = async (options) => {
  const { guildId, user, adminId, action } = options;

  try {
    const [serverConfig, userProfile] = await Promise.all([
      Config.findOrCreate(guildId),
      User.findOrCreate(user.id),
    ]);

    const isUserBlacklisted = serverConfig.blacklist.some((id) => id.startsWith(user.id)) && userProfile.blacklisted;

    if (action === "add") {
      if (isUserBlacklisted) return "already_in";

      serverConfig.blacklist.push(`${user.id}-${adminId}-${Date.now()}`);
      userProfile.blacklisted = true;
    } else if (action === "remove" && userProfile.blacklisted) {
      serverConfig.blacklist = serverConfig.blacklist.filter(
        (id) => !id.startsWith(user.id)
      );
      userProfile.blacklisted = false;
    } else {
      return true;
    }

    // Save both updated records
    await Promise.all([serverConfig.save(), userProfile.save()]);
    return true;
  } catch (error) {
    console.error("Error handling blacklist action:", error);
    return false;
  }
};
