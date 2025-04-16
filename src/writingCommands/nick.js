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

            if (!isAdmin) return await message.reply("Não tenho permissões para alterar o seu nome.");

            if (!hasRole && !isAdmin) {
                return message.reply({ content: "Você precisa **adquirir** o cargo da season!" });
            }
            if (!args || !args[0]) {
                return message.reply({ content: "Use o comando da seguinte forma: **!nick seu_novo_nick_aqui**" });
            }
            const _nN = args[0];
            const _nameBefore = message.member.displayName.split("|")[1];
            const _rank = message.member.displayName.split("|")[0];
            const _newName = _nN.includes("|") ? _nN.split("|")[1].trim() : _nN;
            const newName = _nN.includes("|") ? _rank + " | " + _nN.split("|")[1].trim() : _rank + " | " + _nN;

            await message.member.setNickname(newName);
            await message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Mudança de nick feita`)
                        .setDescription(`Mude seu nick para **${_newName}**`)
                        .setTimestamp()
                        .setFooter({ text: `Por: ${message.client.user.username}` })
                        .setColor(0xFF0000)
                ]
            });
        } catch (error) {
            await message.reply("Não tenho permissões para alterar o seu nome.");
        }
    }
};