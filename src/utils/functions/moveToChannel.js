const { PermissionFlagsBits } = require("discord.js");

/**
 * Moves a user to a specified voice channel.
 * 
 * @param {GuildMember} member - The member to move.
 * @param {VoiceChannel} channel - The voice channel to move the member to.
 */
module.exports = async function moveToChannel(member, channel) {
    if (!member || !channel) return;
    
    try {
        await member.voice.setChannel(channel);
        console.log(`Moved ${member.user.tag} to ${channel.name}`);
    } catch (error) {
        console.error(`Failed to move ${member.user.tag} to ${channel.name}: ${error.message}`);
    }
};
