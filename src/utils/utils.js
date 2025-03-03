const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    Colors,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ButtonInteraction,
} = require("discord.js");
const Bet = require("../structures/database/bet");
const User = require("../structures/database/User");
const myColours = require("../structures/colours");


class Utils {
    constructor() {
        this.name = 'utilsCreate';
    }
    /**
     * @param {import("discord.js").ChatInputCommandInteraction} interaction 
     */
    execute(interaction) {
        if (interaction.user.id !== "877598927149490186") {
            return interaction.reply({ content: "Você não tem permissão para usar este comando.", flags: 64 });
        }

        const channel = interaction.options.getChannel("canal");
        const amount = interaction.options.getInteger("valor");

        return this.createBet(interaction, channel, amount);
    }
    removeLoss = async (user) => {
        const userId = user.id;

        return await User.findOneAndUpdate(
            { "player.id": userId, losses: { $gt: 0 } },
            {
                $inc: { losses: Math.max(0, -1) }
            },
            { upsert: true, new: true }
        );

    }
    createBet = async (interaction, channel, amount) => {
        try {
            const betType = channel.name.split("・")[1];

            const newBet = new Bet({
                betType,
                amount,
                betChannel: { id: channel.id, name: channel.name },
                status: "on"
            });

            await newBet.save();
            await sendBetEmbed(interaction, betType, newBet, amount, channel);
        } catch (err) {
            console.error(`Erro ao criar aposta no canal ${channel.name}:`, err);
        }
    }
    addLoss = async (userId) => {
        return await User.findOneAndUpdate(
            { "player.id": userId },
            {
                $inc: { losses: 1 }
            },
            { upsert: true, new: true }
        );
    }
    removeCredit = async (userId, amount) => {
        return await User.findOneAndUpdate(
            { "player.id": userId },
            {
                $inc: { credit: -amount }
            },
            { new: true, upsert: true }
        );
    }
    addCredit = async (userId, amount, isAdmin) => {
        return await User.findOneAndUpdate(
            { "player.id": userId },
            {
                $inc: { credit: amount },
                $set: { isAdmin }
            },
            { new: true, upsert: true }
        );
    }
    setBetWinner = async (bet, member) => {
        const userId = member.id;
        const { amount } = bet;
        const isAdmin = member?.permissions?.has(PermissionFlagsBits.Administrator) || false;

        const embed = new EmbedBuilder()
            .setDescription(`# Gerenciador de crédito\nCrédito de **${amount}€** foi adicionado a <@${userId}>!`)
            .setColor(myColours.bright_blue_ocean)
            .setFooter({ text: "Você pode guardar este crédito ou receber do mediador..." })
            .setTimestamp();

        // Atualiza ou cria usuário no banco
        const userProfile = await this.addCredit(userId, parseInt(amount), isAdmin, 1);

        // Atualiza aposta
        bet.winner = userId;
        bet.status = ["won"];
        await bet.save();
        await this.addWin(member);

        return { embed, userProfile };
    }
    addCredit = async (userId, amount, isAdmin) => {
        return await User.findOneAndUpdate(
            { "player.id": userId },
            {
                $inc: { credit: amount },
                $set: { isAdmin }
            },
            { new: true, upsert: true }
        );
    }
    removeCredit = async (userId, amount) => {
        return await User.findOneAndUpdate(
            { "player.id": userId },
            {
                $inc: { credit: -amount }
            },
            { new: true, upsert: true }
        );
    }
    addWin = async (user, interaction) => {
        const userId = user.id;

        // Atualiza ou cria o usuário no banco de dados
        const userProfile = await User.findOneAndUpdate(
            { "player.id": userId },
            {
                $inc: { wins: 1 },
                $set: { "player.id": userId }
            },
            { new: true, upsert: true }
        );
        return userProfile;
    }
    addLossWithAmount = async (userId, interaction, bet) => {
        if (!userId) return this.sendReply(interaction, "Membro inválido.");
        const { amount } = bet;
        // You can skip fetching the member if you don't need it elsewhere
        const isAdmin = interaction.guild.members.cache.has(userId) && interaction.guild.members.cache.get(userId).permissions.has(PermissionFlagsBits.Administrator);

        // Attempt to find and update the user profile


        return await User.findOneAndUpdate(
            { "player.id": userId },
            {
                $setOnInsert: {
                    isAdmin: isAdmin,
                },
                $inc: { losses: 1, moneyLost: amount[0] }
            },
            { upsert: true, new: true }
        );
    }
    addLoss = async (user, interaction) => {
        if (!user) return this.sendReply(interaction, "Membro inválido.");
        const userId = user.id;
        const member = interaction.guild.members.cache.get(userId);
        const isAdmin = member.permissions.has(PermissionFlagsBits.Administrator);

        return await User.findOneAndUpdate(
            { "player.id": userId },
            {
                $setOnInsert: {
                    isAdmin: isAdmin,
                },
                $inc: { losses: 1 }
            },
            { upsert: true, new: true }
        );
    }
    sendReply = async (interaction, content) => {
        return interaction.replied || interaction.deferred
            ? interaction.followUp({ content, flags: 64 })
            : interaction.reply({ content, flags: 64 });
    }
    /**
     * 
     * @param {""} userId 
     * @param {import("discord.js").Interaction} interaction 
     * @returns 
     */
    removeWinBet = async (userId, bet, interaction) => {
        const user = interaction.guild.members.cache.get(userId);
        const { amount, _id, betChannel } = bet;

        // Create the main embed message
        const embed = new EmbedBuilder()
            .setDescription(`# Gerenciador de crédito\nCrédito de **${amount}€** foi removido de <@${userId}>!`)
            .setColor(Colors.DarkRed)
            .setTimestamp();

        // Create the log embed
        const logEmbed = EmbedBuilder.from(embed)
            .addFields(
                { name: "ID da aposta:", value: _id?.toString() || "ID inválido" },
                { name: "Valor removido", value: isNaN(amount) ? "Valor inválido" : `${amount}€` },
                { name: "Canal da aposta", value: `<#${betChannel.id}>` }
            )
            .setFooter({ text: `Por ${interaction.user.username}` });

        // Log channel ID (use a constant to avoid magic numbers)
        const WIN_LOG_CHANNEL_ID = "1339329876662030346";
        const winLogChannel = interaction.guild.channels.cache.get(WIN_LOG_CHANNEL_ID);

        // Use findOneAndUpdate to find and update the user in a single operation
        const updatedUser = await User.findOneAndUpdate(
            { "player.id": userId },
            {
                $set: {
                    "player.name": user.user.username,
                    "isAdmin": user.permissions.has(PermissionFlagsBits.Administrator),
                },
                $inc: {
                    credit: -Math.max(0, amount),
                    wins: -1,
                },
            },
            { new: true, upsert: true } // Ensure that the user is created if not found, and return the updated user
        );

        // Reset bet data
        bet.status = "started";
        bet.winner = "";
        await bet.save();

        // Send log embed to the win log channel
        winLogChannel.send({ embeds: [logEmbed] });

        return { embed, logEmbed };
    }
    removeWin = async (user, interaction) => {
        return await User.findOneAndUpdate(
            { "player.id": user.id },
            {
                $set: {
                    "player.name": user.username,
                },
                $inc: {
                    wins: -1,
                },
            },
            { new: true, upsert: true } // Ensure that the user is created if not found, and return the updated user
        );
    }
    async returnServerRank(interaction) {
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

        const users = await User.find().sort({ wins: -1 });
        const perPage = 10;
        let page = 0;

        // Find the user's rank in the sorted array
        const userRank = users.findIndex(u => u.player.id === interaction.user.id) + 1;
        const firstRanked = interaction.guild.members.cache.get(users[0].player.id);

        const generateEmbed = async () => {
            const start = page * perPage;
            const paginatedUsers = users.slice(start, start + perPage);
            const returnedUser = await module.exports.returnUserRank(interaction.user, interaction);


            const userStats = {
                "Vitórias": returnedUser.foundUser.wins ?? 0,
                "Posição": userRank > 0 ? `${userRank}` : "Não classificado"
            };

            return new EmbedBuilder()
                .setThumbnail(firstRanked.displayAvatarURL())
                .setTitle("Ranking de Vitórias")
                .setDescription(
                    paginatedUsers.map((user, index) =>
                        `**${start + index + 1}° -** <@${user.player.id}>: ${user.wins ?? 0} vitórias`
                    ).join("\n") +
                    `\n\n**Suas estatísticas:**\n**Vitórias**: ${userStats.Vitórias}\n**Posição**: ${userStats.Posição}`
                )
                .setFooter({ text: `Página ${page + 1}` })
        };

        const row = () => new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("prev")
                .setLabel("Voltar")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 0),
            new ButtonBuilder()
                .setCustomId("next")
                .setLabel("Próxima")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled((page + 1) * perPage >= users.length)
        );

        // Send the interaction with response and components
        const message = await interaction.followUp({
            embeds: [await generateEmbed()], // Await to resolve the async function
            components: [row()],
            fetchReply: true,
            flags: 64
        });

        // Collector for button interactions
        const collector = message.createMessageComponentCollector({ time: 120000 });

        collector.on("collect", async (btnInteraction) => {
            if (btnInteraction.customId === "prev") page--;
            if (btnInteraction.customId === "next") page++;

            await btnInteraction.update({ embeds: [await generateEmbed()], components: [row()] });
        });

        return { embed: await generateEmbed() };
    }
    /**
     * 
     * @param {ButtonInteraction} interaction 
     * @returns 
     */
    async returnUserRank(user, interaction, option) {
        // Default to interaction.user if no user is provided
        user = user ?? interaction.user;

        // Get member from the guild
        const member = interaction.guild.members.cache.get(user.id);

        // Fetch or create the user profile with upsert
        const foundUser = await User.findOneAndUpdate(
            { "player.id": user.id },
            {
                $setOnInsert: {
                    isAdmin: member.permissions.has(PermissionFlagsBits.Administrator),
                }
            },
            { upsert: true, new: true }
        );

        // Fetch color from avatar URL or default to white
        const color = Colors.White;

        // Build the embed for user profile
        const embed = new EmbedBuilder()
            .setAuthor({
                name: `Perfil de ${user.username}`,
                iconURL: user.displayAvatarURL({ dynamic: true, size: 512, format: 'png' }),
            })
            .setColor(color)
            .addFields({
                name: "Estatísticas",
                value: `
                    **Vitórias:** ${foundUser.wins ?? 0} ︱ **Derrotas:** ${foundUser.losses ?? 0}
                    **Crédito disponível:** ${foundUser.credit !== 0 ? foundUser.credit : 0}€ ︱ **Vezes jogadas:** ${foundUser.betsPlayed.length ?? 0}
                    **Blacklist:** ${foundUser.blacklisted ? "Sim" : "Não"} ︱ **Dinheiro perdido:** ${foundUser.moneyLost ?? 0}€
                `,
            })
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512, format: 'png' }));

        // Conditional reply or log the embed based on the option
        if (option === "send") {
            return interaction.followUp({ embeds: [embed], flags: 64 });
        }

        return { foundUser, embed };
    }
};

async function getBetById(betId) {
    const bet = await Bet.findOne({ _id: betId });
    return bet;
}
async function sendBetEmbed(interaction, betType, betData, amount, channelToSend) {
    const enterBetId = `enter_bet-${betType}-${betData._id}-${amount}`;
    const outBetId = `out_bet-${betType}-${betData._id}-${amount}`;

    const embed = new EmbedBuilder()
        .setDescription(`## Aposta de ${betData.amount}€  |  ${betData.betType}\n> Escolha um time para entrar e aguarde a partida começar!`)
        .addFields([
            { name: "Equipa 1", value: "Slot vazio", inline: true },
            { name: "Equipa 2", value: "Slot vazio", inline: true }
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
    return;
}

module.exports = new Utils();