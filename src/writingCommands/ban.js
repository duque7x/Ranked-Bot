const { PermissionFlagsBits, Message, EmbedBuilder, userMention, Colors } = require("discord.js");
const { returnUserRank } = require("../utils/utils");
const Match = require("../structures/database/match");

module.exports = {
    name: "ban", // Command name

    /**
     * @param {Message} message
     * @param {string[]} args
     * @param {BotClient} client
     */
    async execute(message, args, client) {
        const isAdmin = message.member.permissions.has(PermissionFlagsBits.Administrator);
        let userId = resolveUserId(args[0]);

        if (!isAdmin) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Você não tem permissões")
                        .setDescription(`Voce precisa ser ADM para banir alguem.`)
                        .setTimestamp()
                        .setColor(0xff0000),
                ],
            });
        }
        if (!args || !args[0]) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Uso incorreto do comando")
                        .setDescription(`Use da seguinte maneira: \`!ban 123456789 \``)
                        .setTimestamp()
                        .setColor(0xff0000),
                ],
            });
        }
        let member = message.guild.members.cache.get(userId);

        if (!member) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Membro não encontrado")
                        .setDescription(`Tente novamente com o id do usuario ou menção dele!`)
                        .setTimestamp()
                        .setColor(0xff0000),
                ],
            });
        }

        const msg = await message.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Confirmar banimento de ${member.displayName}`)
                    .setDescription(`Clica no ✅ para confirmar...`)
                    .setTimestamp()
                    .setColor(Colors.DarkPurple),
            ],
        });
        await msg.react("✅");


        const collector = msg.createReactionCollector({
            time: 100000,
            filter: (reaction, user) => reaction.emoji.name === "✅" && !user.bot
        });

        collector.on("collect", async (reaction, user) => {
            const memberReacted = await reaction.message.guild.members.fetch(user.id);

            const isAdmin = memberReacted.permissions.has(PermissionFlagsBits.Administrator);
            if (!isAdmin) return message.reply(`<@${user.id}>, você não tem permissão para confirmar o banimento!`);

            collector.stop();
            await msg.reactions.removeAll();

            await msg.edit({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`Banido com sucesso`)
                        .setDescription(`Usuario <@${userId}> foi banido.`)
                        .setTimestamp()
                        .setColor(Colors.DarkGreen)
                        .setFooter({ text: `Por: ${user.displayName}` }),
                ],
            });
            try {
                await member.ban();
            } catch (error) {
                await msg.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`Banimento falhado`)
                            .setDescription(`Não foi possível banir <@${userId}>!`)
                            .setTimestamp()
                            .setColor(0xff0000)
                            .setFooter({ text: `Por: ${user.displayName}` }),
                    ],
                });
                console.log(error);
            }
        });
    },
};

function resolveUserId(userId = "") {
    return !userId.includes("<") && /^\d+$/.test(userId)
        ? userId
        : userId.replace(/[<@!>]/g, "");
}
