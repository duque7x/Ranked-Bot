const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: "nick",
    /**
     * @param {import("discord.js").Message} message
     */
    async execute(message, args) {
        try {
            const hasRole = message.member.roles.cache.has("1350144276834680912");
            const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);

            // If the user has admin permission, allow them to change their name
            if (isAdmin) return message.reply("Não tenho permissões para alterar o seu nome.");;

            // If they don't have the role and aren't an admin, notify them
            if (!hasRole) {
                return message.reply({ content: "Você precisa **adquirir** o cargo da season!" });
            }

            // If no nickname is provided
            if (!args || !args[0]) {
                return message.reply({ content: "Use o comando da seguinte forma: **!nick seu_novo_nick_aqui**" });
            }

            const displayName = message.member.displayName;
            const _nN = args[0];

            const _rank = displayName.includes("|") ? displayName.split("|")[0].trim() : "";
            const _newName = _nN.includes("|") ? _nN.split("|")[1].trim() : _nN;
            const newName = _rank ? `${_rank} | ${_newName}` : _newName;

            if (newName.length > 32) {
                newName = newName.slice(0, 32);
            }

            await message.member.setNickname(newName);
            await message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Mudança de nick`)
                        .setDescription(`Mudei seu nick para **${_newName}**`)
                        .setTimestamp()
                        .setFooter({ text: `Por: ${message.client.user.username}` })
                        .setColor(0xFF0000)
                ]
            });
        } catch (error) {
            await message.reply("Não tenho permissões para alterar o seu nome.");
            console.error(error);
        }
    }
};
