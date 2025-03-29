const { EmbedBuilder, Colors } = require("discord.js");
const Config = require("../../structures/database/configs");
const User = require("../../structures/database/User");
const returnUserRank = require("../functions/returnUserRank");

module.exports = async (action, guildId, user, adminId, interaction) => {
    const serverConfig = await Config.findOne({ "guild.id": guildId });
    const userProfile = (await returnUserRank(user, interaction)).foundUser;

    if (action === "add") {
        if (serverConfig.blacklist.some(id => id.startsWith(user.id))) {
            return await interaction.reply({ content: `# ${user} já está na blacklist!`, flags: 64 });
        }

        serverConfig.blacklist.push(`${user.id}-${adminId}-${Date.now()}`);
        userProfile.blacklisted = true;
        await serverConfig.save();
        await userProfile.save();

        const embed = new EmbedBuilder()
            .setTitle("Blacklist")
            .setColor(0xff0000)
            .setDescription(`${user} foi adicionado à blacklist!\n\n-# Por <@${adminId}>`)
            .setTimestamp()
            .setThumbnail(user.displayAvatarURL());

        return embed;
    } else if (action === "remove") {
        // Fix: Correctly filter out entries that belong to the user
        serverConfig.blacklist = serverConfig.blacklist.filter(id => !id.startsWith(user.id));
        userProfile.blacklisted = false;
        await serverConfig.save();
        await userProfile.save();

        const embed = new EmbedBuilder()
            .setTitle("Blacklist")
            .setColor(Colors.Grey)
            .setDescription(`${user} foi removido da blacklist!\n-# Por <@${adminId}>`)
            .setTimestamp()
            .setThumbnail(user.displayAvatarURL());

        return embed;
    }
}