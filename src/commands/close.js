const { EmbedBuilder, Message, PermissionFlagsBits, Colors, ActionRowBuilder } = require("discord.js");
const BotClient = require("..");
const Bet = require("../structures/database/bet");

module.exports = {
    name: "close", // Command name
    usage: "`!close idDaAposta`\n\n!bet 67a9366b0995a45347da7fac",
    description: "Este comando fecha uma aposta, você pode encontrar o id da aposta na descrição!",
    /**
     * @param {Message} message 
     * @param {string[]} args 
     * @param {BotClient} client 
     */
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        const { member, guild } = message;
        const fila = args[0];
        const id = args[1];

        if (fila === "fila") {
            const bet = await Bet.findOne({ "_id": id }); // Correct MongoDB query
            const channel = await client.channels.fetch(bet.betChannel.id);
            if (!bet) return this.sendTemporaryMessage(message, "❌ Nenhuma aposta encontrada com esse ID.");
            if (bet.status == "off") return this.sendTemporaryMessage(message, "# Esta aposta ja esta fechada!");


            bet.status = "off";
            bet.save();
            if (!channel) return console.error("Erro: O canal não foi encontrado.");

            await channel.edit({
                name: "closed-" + channel.name.replace(/^fila-/, ""), // Replace "fila-" instead of slicing
                permissionOverwrites: [
                    {
                        id: guild.id, // @everyone
                        deny: [PermissionFlagsBits.ViewChannel] // Hide from everyone
                    },
                    ...bet.players.filter(Boolean).map(playerId => ({
                        id: playerId,
                        deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                    }))
                ],
                parent: "1337588697280942131"
            });

            return message.reply("`Fila fechada com sucesso!`");
        }

    },
    sendTemporaryMessage(msg, content) {
        msg.reply(content).then(mg => {
            setTimeout(() => {
                mg.delete();
            }, 3000);
        });
    }
};
