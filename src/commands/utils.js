const { EmbedBuilder, Message, PermissionFlagsBits, Colors, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const BotClient = require("..");
const Bet = require("../structures/database/bet");
const User = require("../structures/database/User");
const myColours = require("../structures/colours");

module.exports = {
    name: "utils",
    usage: "`!utils`",
    description: "Este arquivo tem várias funções úteis.",
    /**
     * @param {Message} message 
     * @param {string[]} args 
     * @param {BotClient} client 
     */
    async execute(message, args, client, channel, amount) {
        if (message.author.id !== "877598927149490186") return;
        return this.createBet(message, channel, amount, client);
    },

    async createBet(message, channel, amount, client) {
        try {
            const betType = channel.name.split("・")[1]; // Extract the bet type from the channel name

            const newBet = new Bet({
                betType,
                amount,
                betChannel: { id: channel.id, name: channel.name },
                status: "on"
            });

            await newBet.save(); // Save the bet to MongoDB
            await this.sendBetEmbed(message, betType, newBet, amount, channel, client);
        } catch (err) {
            console.error(`Error creating bet in channel ${channel.name}:`, err);
        }
    },

    async sendBetEmbed(message, betType, betData, amount, channelToSend, client) {
        const enterBetId = `enter_bet-${betType}-${betData._id}-${amount}`;
        const outBetId = `out_bet-${betType}-${betData._id}-${amount}`;

        const embed = new EmbedBuilder()
            .setDescription(`## Aposta de ${betData.amount}€  |  ${betData.betType}\n> Escolha um time para entrar e aguarde a partida começar!`)
            .addFields([
                { name: "Equipa 1", value: `Slot vazio`, inline: true },
                { name: "Equipa 2", value: `Slot vazio`, inline: true }
            ])
            .setColor(Colors.White);

        const enterBet = new ButtonBuilder()
            .setCustomId(enterBetId)
            .setLabel("Entrar na aposta")
            .setStyle(ButtonStyle.Success);

        const outBet = new ButtonBuilder()
            .setCustomId(outBetId)
            .setLabel("Sair da aposta")
            .setStyle(ButtonStyle.Danger);

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`select_menu-${betType}-${betData._id}`)
            .addOptions([
                { label: "Iniciar aposta", value: "start_bet_value" },
                { label: "Voltar", value: "go_back" }
            ]);

        const row1 = new ActionRowBuilder().addComponents(enterBet, outBet);
        const row2 = new ActionRowBuilder().addComponents(selectMenu);

        await channelToSend.send({ embeds: [embed], components: [row2, row1] });
    },

    sendTemporaryMessage(msg, content) {
        msg.reply(content).then(mg => {
            setTimeout(() => mg.delete(), 2000);
        });
    },

    /**
     * 
     * @param {string} userId 
     * @param {import("discord.js").Interaction} interaction 
     * @param {Bet} bet
     * @returns 
     */
    async addWins(userId, interaction, bet) {
        console.log("bet._id:", bet._id);
        console.log("amount:", amount);

        const user = interaction.guild.members.cache.get(userId);
        const amount = bet.amount ?? 1; // Default to 1 if amount is not provided
        const embed = new EmbedBuilder()
            .setDescription(`# Gerenciador de credito\nCredito de ${amount}€ adicionado a <@${userId}>!`)
            .setColor(myColours.bright_blue_ocean)
            .setTimestamp();

        const logEmbed = new EmbedBuilder()
            .setDescription(`# Gerenciador de credito\nCredito de ${amount}€ adicionado a <@${userId}>!`)
            .setColor(myColours.bright_blue_ocean || '#0099ff') // Default color in case myColours.bright_blue_ocean is undefined
            .setTimestamp()
            .addFields(
                { name: "Id da aposta:", value: bet._id ? bet._id.toString() : 'ID inválido' }, // Ensure bet._id is a valid value
                { name: "Valor ganho", value: amount && !isNaN(amount) ? `${amount}€` : 'Valor inválido' } // Check if amount is valid
            );


        const winLogChannel = interaction.guild.channels.cache.get("1339329876662030346");
        const existingUser = await User.findOne({ "player.id": userId });

        if (existingUser) {
            existingUser.credit = parseInt(existingUser.credit) + parseInt(amount);
            existingUser.isAdmin = user.permissions.has(PermissionFlagsBits.Administrator);
            bet.status = "won";

            await existingUser.save();
            await bet.save();

            winLogChannel.send({ embeds: [logEmbed] });
            return { embed, logEmbed };
        }

        const winnerUserProfile = new User({
            player: { name: user.user.username, id: userId },
            credit: parseInt(amount),
            isAdmin: user.permissions.has(PermissionFlagsBits.Administrator)
        });

        await winnerUserProfile.save();
        winLogChannel.send({ embeds: [logEmbed] });
        bet.status = "won";
        await bet.save();

        return { logEmbed, embed };
    }
};