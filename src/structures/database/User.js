const BotClient = require("../..");

/**
 * 
 * @param {*} id 
 * @param {*} guildId 
 * @param {BotClient} client 
 */
exports.findOrCreate = async function (user, guildId, client) {
    const guild = await client.api.guilds.fetch(guildId);
    const apiuser = await guild.users.fetch(user.id, user.username);

    return apiuser;
}