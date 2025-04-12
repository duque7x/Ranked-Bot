const { EmbedBuilder } = require("@discordjs/builders")
/**
 * 
 * @param {{ event: String, channelId: String, allowedChannelId: String, isAdmin: Boolean, name: String }} options 
 * @returns 
 */
module.exports = (options) => {
    const { event, channelId, allowedChannelId, isAdmin, name } = options;
    if (channelId !== allowedChannelId && !isAdmin) {
         event.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Você não pode usar este comando aqui.")
                    .setDescription(`Vá pro canal <#${allowedChannelId}> e use o comando.`)
                    .setTimestamp()
                    .setColor(0xff0000)
            ]
        });
        return true;
    }
    return false;
}