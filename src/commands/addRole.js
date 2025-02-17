const { EmbedBuilder, Message, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const BotClient = require("..");
const myColours = require("../structures/colours");

module.exports = {
    name: "addRole",
    description: "Adiciona um cargo a um usuário.",
    usage: "`!addRole @cargo @usuário`",

    /**
     * @param {Message} message 
     * @param {string[]} args 
     * @param {BotClient} client 
     */
    execute(message, args, client) {
        if (args.length < 2) {
            return message.reply("Uso incorreto! O formato correto é: `!addRole @cargo @usuário`");
        }

        const { guild } = message;

        const roleMatch = args[0].match(/^<@&(\d+)>$/);
        const userMatch = args[1].match(/^<@!?(\d+)>$/);

        if (!roleMatch || !userMatch) {
            return message.reply("Formato inválido! Certifique-se de mencionar corretamente o cargo e o usuário.");
        }

        const role = guild.roles.cache.get(roleMatch[1]);
        const user = guild.members.cache.get(userMatch[1]);

        if (!role) {
            const roleNames = guild.roles.cache
                .map(r => r.name)
                .filter(r => !r.includes("DONO") && !r.includes("everyone"))
                .join(', ');

            return message.reply(`Cargo não encontrado! Cargos disponíveis:\n ${roleNames}`);
        }

        if (!user) {
            return message.reply("Usuário não encontrado! Certifique-se de mencioná-lo corretamente.");
        }

        if (role.name.toLowerCase().includes("dono")) {
            return message.reply("Você não pode atribuir esse cargo.");
        }

        // Definição de rótulos para os cargos
        const prematives = {
            administrador: "[ADM]",
            staff: "[STAFF]",
            mediadores: "[MED]",
            team: "[SS]",
            analista: "[ANALISE]",
        };

        // Verifica se o cargo tem um rótulo correspondente
        let roleTag = "";
        for (const key in prematives) {
            if (role.name.toLowerCase().includes(key)) {
                roleTag = prematives[key];
                break;
            }
        }

        user.roles.add(role).then(() => {
            const displayName = `${roleTag} ${user.user.username}`;
            const logChannel = this.logChannel(message);
            const embed = new EmbedBuilder()
                .setTitle("Gerenciador de cargos!")
                .setDescription(`O cargo <@&${role.id}> foi adicionado a ${user}!\n\n-# Por: <@${message.author.id}>`)
                .setColor(myColours.bright_blue_ocean)
                .setTimestamp()
                .setFooter({ text: "Por APOSTAS" });

            user.setNickname(displayName, `Cargo ${role.name} adicionado!`).catch(_ => this.sendTemporaryMessage(message, "Ocorreu um erro ao tentar mudar o nome."));
            message.channel.send({ embeds: [embed] });
            logChannel.send({ embeds: [embed] });
        }).catch(err => {
            console.error(err);
            message.reply("Ocorreu um erro ao tentar adicionar o cargo.");
        });
    },
    logChannel(message) {
        return message.guild.channels.cache.get("1340360434414522389");
    },
    sendTemporaryMessage(msg, content) {
        msg.reply(content).then(mg => {
            setTimeout(() => {
                mg.delete();
            }, 2000);
        });
    }
};
