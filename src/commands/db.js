const { EmbedBuilder, Message, PermissionFlagsBits, Colors, ActionRowBuilder } = require("discord.js");
const BotClient = require("..");
const Bet = require("../structures/database/bet");
const User = require("../structures/database/User");

module.exports = {
    name: "db", // Command name

    /**
     * @param {Message} message 
     * @param {string[]} args 
     * @param {BotClient} client 
     */
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const reset = args[3];
        const bet = args[0];
        const id = args[1];

        if (reset === "reset" && !bet) {
            await Bet.deleteMany({});
            await User.deleteMany({});
            
            return message.reply("`Dado de bases recomeçada com sucesso!`");
        }
        if (bet === "bet" && !id) {
            await Bet.updateMany({}, { $set: { players: [] } });
            return message.reply("`Todos jogadores removidos das suas apostas.`");
        }
        if (id && bet=== "bet") {
            const bet = await Bet.findOne({ "_id": id });

            if (!bet) return this.sendTemporaryMessage(message, "# Esta aposta nao exite!");
            const winner = bet.winner ? `<@${bet.winner}>` : `<@877598927149490186>`
            const embed = new EmbedBuilder()
                .setColor(Colors.DarkButNotBlack)
                .setTitle("Aposta no banco de Dados")
                .setDescription("Aqui esta a aposta:")
                .addFields([
                    {
                        name: `Aposta ${bet._id}`,
                        value: `**ID:** ${bet._id}\n**Jogadores:** ${bet.players.join(", ")}\n**Canal:** <#${bet.betChannel?.id}>\n**Estado:** ${bet.status}\n**Ganhador:** ${winner}`
                    }
                ])

            return message.reply({
                embeds: [embed]
            })
        };

        if (allBets.length === 0) {
            return message.reply("❌ Não há apostas no banco de dados!");
        }

        // Create an embed to display the bets
        const embed = new EmbedBuilder()
            .setColor(Colors.DarkButNotBlack)
            .setTitle("Apostas no Banco de Dados")
            .setDescription("Aqui estão todas as apostas registradas:");

        // Loop through all bets and add them to the embed
        allBets.forEach((bet, index) => {
            embed.addFields(
                {
                    name: `Aposta ${index + 1}`,
                    value: `**ID:** ${bet._id}\n**Jogadores:** ${bet.players.join(", ")}\n**Canal:** <#${bet.betChannel?.id}>\n**Estado:** ${bet.status}`
                }
            );
        });

        // Send the embed to the channel
        message.channel.send({ embeds: [embed] });
    },
    sendTemporaryMessage(msg, content) {
        msg.reply(content).then(mg => {
            setTimeout(() => {
                mg.delete();
            }, 3000);
        });
    }
};
