const { EmbedBuilder, Message, Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const BotClient = require("..");
const Bet = require("../structures/database/bet"); // Import your Mongoose model
const Config = require("../structures/database/configs");

module.exports = {
    name: "bet",

    /**
     * @param {Message} message 
     * @param {string[]} args 
     * @param {BotClient} client 
     */
    async execute(message, args, client) {
        const { guildId, channel, author, guild } = message;
        let betType = args[0];
        let channelToSend = await guild.channels.fetch(args[1]);
        let amount = args[2] ?? "1";
        const userId = author.id;
        const serverConfig = Config.findOne({ "guild.id": guildId }) ?? new Config({ guild: { id: guildId, name: guild.name }, state: { bets: { status: "on" }, rank: { status: "on" } } });

        if (serverConfig.state.bet.status == "off") return this.sendTemporaryMessage("# As apostas estão fechadas no momento!");
        
        if (!this.validBet(betType)) {
            return this.sendTemporaryMessage(message, "Bet não é válida!");
        }
        if (!this.validAmmount(amount)) {
            return this.sendTemporaryMessage(message, "Esse valor não é válido!");
        }
        const activeBet = await Bet.find({ players: author.id });

        const restrictedUsers = ["877598927149490186", "1323068234320183407", "1031313654475395072"];

        if (activeBet && activeBet.status !== "off" && !restrictedUsers.includes(userId)) {
            const channelIdActive = activeBet.betChannel?.id ? activeBet.betChannel?.id : "";
            console.log("NIgga");
            
            return this.sendTemporaryMessage(message, `# ❌ Você já está em outra aposta! <#${channelIdActive}>`);
        }

        try {
            // 🟢 Create a new bet in MongoDB
            const newBet = new Bet({
                betType: betType,
                amount: amount,
                betChannel: {
                    id: channelToSend.id,
                    name: channelToSend.name
                }
            });

            await newBet.save(); // Save to MongoDB

            console.log("Bet created: betID", newBet._id);

            // Send embed message
            this.sendBetEmbed(message, betType, newBet, amount, channelToSend, client);
        } catch (err) {
            console.error("Error creating bet:", err);
            this.sendTemporaryMessage(message, "❌ Ocorreu um erro ao criar a aposta!");
        }
    },

    validBet(type) {
        return ["1x1", "2x2", "3x3", "4x4", "5x5", "6x6", "1v1", "2v2", "3v3", "4v4", "5v5", "6v6"].includes(type);
    },
    validAmmount(amt) {
        return /[0-9]/.test(parseInt(amt))
    },
    sendTemporaryMessage(msg, content) {
        msg.channel.send(content).then(m => {
            setTimeout(() => m.delete(), 2000);
        });
    },
    /**
     * 
     * @param {Message} message 
     * @param {String} betType 
     * @param {Bet} betData 
     * @param {BotClient} client 
     * @param {import("discord.js").Channel} channelToSend
     */
    async sendBetEmbed(message, betType, betData, amount, channelToSend, client) {
        const enterBetId = `enter_bet-${betType}-${betData._id}-${amount}`
        const outBetId = `out_bet-${betType}-${betData._id}-${amount}`

        const embed = new EmbedBuilder()
            .setDescription(`## Aposta de ${betData.amount}€  |  ${betData.betType}\n> Escolha um time para entrar e aguarde a partida começar!`)
            .addFields([
                {
                    name: "Equipa 1",
                    value: `Slot vazio`,
                    inline: true
                },
                {
                    name: "Equipa 2",
                    value: `Slot vazio`,
                    inline: true
                }
            ])
            .setColor(Colors.White);

        const enterBet = new ButtonBuilder()
            .setCustomId(enterBetId)
            .setLabel("Entrar na aposta")
            .setStyle(ButtonStyle.Success)

        const outBet = new ButtonBuilder()
            .setCustomId(outBetId)
            .setLabel("Sair da aposta")
            .setStyle(ButtonStyle.Danger)

        /* const startBet = new ButtonBuilder()
             .setCustomId(startBetId)
             .setLabel("Iniciar")
             .setStyle(ButtonStyle.Secondary) **/
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`select_menu-${betType}-${betData._id}`)
            .addOptions({
                label: "Iniciar aposta",
                value: "start_bet_value"
            })
            .addOptions({
                label: "Voltar",
                value: "go_back"
            });

        const row1 = new ActionRowBuilder().addComponents(enterBet, outBet);
        const row2 = new ActionRowBuilder().addComponents(selectMenu);
        const msg = await channelToSend.send({ embeds: [embed], components: [row2, row1] });

        return { msg, enterBetId };
    },
};
