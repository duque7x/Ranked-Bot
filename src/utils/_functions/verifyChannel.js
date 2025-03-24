const { EmbedBuilder } = require("@discordjs/builders")
/**
 * 
 * @param {{ event: String, channelId: String, allowedChannelId: String, isAdmin: Boolean, name: String }} options 
 * @returns 
 */
module.exports = async (options) => {
    const { event, channelId, allowedChannelId, isAdmin, name } = options;

    if (channelId !== allowedChannelId && !isAdmin) {
        return event.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Você não pode usar este comando aqui.")
                    .setDescription(`Va pro canal <#${allowedChannelId}> e use o comando.`)
                    .setTimestamp()
            ]
        })
    }
}