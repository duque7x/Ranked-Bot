
const { EmbedBuilder, Message, PermissionFlagsBits, Colors, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const BotClient = require("..");
const Bet = require("../structures/database/bet");
const User = require("../structures/database/User");

module.exports = {
    name: "nigga", // Command name

    /**
     * @param {Message} message 
     * @param {string[]} args 
     * @param {BotClient} client 
     */
    async execute(message, args, client, channel, amount) {
        if (message.author.id !== "877598927149490186") return;

        return this.createBet(message, channel, amount, client)
    },
    async createBet(message, channel, amount, client) {
        try {
            const betType = `${channel.name.split("・")[1]}`; // Extract the bet type from the channel name
            console.log(betType);

            const newBet = new Bet({
                betType: betType,
                amount: amount,
                betChannel: {
                    id: channel.id,
                    name: channel.name
                },
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
            setTimeout(() => {
                mg.delete();
            }, 2000);
        });
    },
    /**
     * 
     * @param {string} userId 
     * @param {string} amount 
     * @param {import("discord.js").Interaction} interaction 
     * @returns 
     */
    async addWins(userId, amount, interaction) {
        // Fetch the existing user profile
        const existingUser = await User.findOne({ "player.id": userId });
        amount = amount ?? 1; // Default to 1 if amount is not provided

        if (existingUser) {
            // Update existing user's wins
            existingUser.wins = parseInt(existingUser.wins) + parseInt(amount);
            await existingUser.save(); // Ensure to save asynchronously

            const embed = new EmbedBuilder()
                .setDescription(`# Gerenciador de vitorias\nVitoria(s) adicionada a <@${userId}>!`)
                .setColor(Colors.Aqua)
                .setTimestamp();

            return interaction.channel.send({ embeds: [embed] });
        }
        const user = interaction.guild.members.cache.get(userId)
        // Create a new user profile if not found
        console.log(user);

        const winnerUserProfile = new User({
            player: {
                name: user.user.username,
                id: userId
            },
            wins: parseInt(amount)
        });
        await winnerUserProfile.save(); // Save the new user profile

        const embed = new EmbedBuilder()
            .setDescription(`# Gerenciador de vitorias\nVitoria(s) adicionada a <@${userId}>!`)
            .setColor(Colors.Aqua)
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }

};