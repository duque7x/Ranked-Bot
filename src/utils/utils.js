const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    Colors,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ButtonInteraction
} = require("discord.js");
const Bet = require("../structures/database/bet");
const User = require("../structures/database/User");
const myColours = require("../structures/colours");
const getColors = require('get-image-colors');

async function getColorFromURL(imageUrl) {
    try {
        const colors = await getColors(imageUrl);
        const dominantColor = colors[0].hex();
        return dominantColor;
    } catch (error) {
        console.error('Error extracting color:', error);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("utils")
        .setDescription("Este arquivo tem várias funções úteis.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName("canal")
                .setDescription("Canal onde a aposta será criada.")
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName("valor")
                .setDescription("Valor da aposta.")
                .setRequired(true)),

    /**
     * @param {import("discord.js").ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        if (interaction.user.id !== "877598927149490186") {
            return interaction.reply({ content: "Você não tem permissão para usar este comando.", flags: 64 });
        }

        const channel = interaction.options.getChannel("canal");
        const amount = interaction.options.getInteger("valor");

        return this.createBet(interaction, channel, amount);
    },

    async createBet(interaction, channel, amount) {
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
    },
    async addWins(userId, interaction, amount) {
        const user = interaction.guild.members.cache.get(userId);
        if (!user) return this.sendReply(interaction, "Usuário inválido.");

        const embed = new EmbedBuilder()
            .setDescription(`# Gerenciador de crédito\nCrédito de **${amount}€** foi adicionado a <@${userId}>!`)
            .setColor(myColours.bright_blue_ocean)
            .setTimestamp();

        // Try to find the user
        let existingUser = await User.findOne({ "player.id": userId });

        if (existingUser) {
            // Ensure existing values are valid
            existingUser.wins = isNaN(existingUser.wins) ? 0 : existingUser.wins;
            existingUser.credit = isNaN(existingUser.credit) ? 0 : existingUser.credit;

            // Update stats
            existingUser.credit += parseInt(amount);
            existingUser.wins += 1;
            existingUser.isAdmin = user.permissions.has(PermissionFlagsBits.Administrator);

            await existingUser.save();
        } else {
            // Create new profile only if user does not exist
            existingUser = new User({
                player: { name: user.user.username, id: userId },
                credit: parseInt(amount),
                isAdmin: user.permissions.has(PermissionFlagsBits.Administrator),
                wins: 1
            });

            await existingUser.save();
        }

        return { embed, existingUser };
    },

    async addLoss(userId, interaction, amount) {
        if (!userId) return this.sendReply(interaction, "Membro inválido.");
        const member = interaction.guild.members.cache.get(userId);

        // First, attempt to find and update the user with an initial value for losses (if necessary)
        const userProfile = await User.findOneAndUpdate(
            { "player.id": userId },
            {
                $setOnInsert: {
                    isAdmin: member.permissions.has(PermissionFlagsBits.Administrator),
                    losses: 0 // Initialize losses to 0 if the document doesn't exist
                }
            },
            { upsert: true, new: true }
        );
        // Then increment the losses
        userProfile.losses += 1; // Increment losses by 1
        userProfile.moneyLost += amount;
        await userProfile.save(); // Save the updated user profile


        return userProfile;
    },

    sendReply(interaction, content) {
        return interaction.replied || interaction.deferred
            ? interaction.followUp({ content, flags: 64 })
            : interaction.reply({ content, flags: 64 });
    },
    /**
     * 
     * @param {""} userId 
     * @param {import("discord.js").Interaction} interaction 
     * @returns 
     */
    async removeWinBet(userId, bet, interaction) {
        const user = interaction.guild.members.cache.get(userId);
        const { amount } = bet;

        const embed = new EmbedBuilder()
            .setDescription(`# Gerenciador de crédito\nCrédito de **${amount}€** foi removido de <@${userId}>!`)
            .setColor(Colors.DarkRed)
            .setTimestamp();

        const logEmbed = EmbedBuilder.from(embed)
            .addFields(
                { name: "ID da aposta:", value: bet._id?.toString() || "ID inválido" },
                { name: "Valor removido", value: isNaN(amount) ? "Valor inválido" : `${amount}€` },
                { name: "Canal da aposta", value: `<#${bet.betChannel.id}>` }
            )
            .setFooter({ text: `Por ${interaction.user.username}` });

        const winLogChannel = interaction.guild.channels.cache.get("1339329876662030346");

        // Buscar usuário no banco
        let existingUser = await User.findOne({ "player.id": userId });

        if (!existingUser) {
            // Se o usuário não existir, criar um novo
            existingUser = new User({
                player: { name: user.user.username, id: userId },
                credit: 0,
                wins: 0,
                isAdmin: user.permissions.has(PermissionFlagsBits.Administrator),
            });
        } else {
            // Atualizar os dados existentes
            existingUser.isAdmin = user.permissions.has(PermissionFlagsBits.Administrator);
            existingUser.credit = Math.max(0, existingUser.credit - amount);
            existingUser.wins = Math.max(0, existingUser.wins - 1);
        }

        await existingUser.save();

        // Resetar os dados da aposta
        bet.status = "started";
        bet.winner = "";
        await bet.save();

        // Enviar o log da atualização
        winLogChannel.send({ embeds: [logEmbed] });

        return { embed, logEmbed };
    },
    async removeWin(userId, amount) {
        const user = interaction.guild.members.cache.get(userId);
        amount = amount ?? 1;

        const embed = new EmbedBuilder()
            .setDescription(`# Gerenciador de vitorias e credito\nCrédito de **${amount}€** foi removido de <@${userId}>!`)
            .setColor(Colors.DarkRed)
            .setTimestamp();

        const logEmbed = new EmbedBuilder()
            .setDescription(`# Gerenciador de vitorias e crédito\nCrédito de **${amount}€** foi removido de <@${userId}>!`)
            .setColor(Colors.DarkRed)
            .setTimestamp()
            .addFields(
                { name: "Valor removido", value: amount && !isNaN(amount) ? `${amount}€` : "Valor inválido" },
            )
            .setFooter({ text: `Por ${interaction.user.username}` });

        const winLogChannel = interaction.guild.channels.cache.get("1339329876662030346");
        const existingUser = await User.findOne({ "player.id": userId });

        if (existingUser) {
            existingUser.credit = parseInt(existingUser.credit) - parseInt(amount);
            existingUser.wins = existingUser.wins <= 0 ? 0 : parseInt(existingUser.credit) - 1;
            existingUser.isAdmin = user.permissions.has(PermissionFlagsBits.Administrator);

            await existingUser.save();

            winLogChannel.send({ embeds: [logEmbed] });
        }

        const winnerUserProfile = new User({
            player: { name: user.user.username, id: userId },
            credit: 0,
            isAdmin: user.permissions.has(PermissionFlagsBits.Administrator),
            wins: 0
        });

        await winnerUserProfile.save();
        winLogChannel.send({ embeds: [logEmbed] });

        return { logEmbed, embed };
    },
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
        const message = await interaction.reply({
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
    },
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
        const color = await getColorFromURL(user.displayAvatarURL()) || Colors.White;
        console.log(foundUser);

        // Build the embed for user profile
        const embed = new EmbedBuilder()
            .setAuthor({
                name: `Perfil de ${user.username}`,
                iconURL: user.displayAvatarURL(),
            })
            .setColor(color)
            .addFields({
                name: "Estatísticas",
                value: `
                    **Vitórias:** ${foundUser.wins ?? 0} ︱ **Derrotas:** ${foundUser.losses ?? 0}
                    **Crédito disponível:** ${foundUser.credit !== 0 ? foundUser.credit : "Nenhum"}€ ︱ **Vezes jogadas:** ${foundUser.betsPlayed.length ?? 0}
                    **Blacklist:** ${foundUser.blacklisted ? "Sim" : "Não"} ︱ **Dinheiro perdido:** -${foundUser.moneyLost ?? 0}€
                `,
            })
            .setThumbnail(user.displayAvatarURL());

        // Conditional reply or log the embed based on the option
        if (option === "send") {
            return interaction.reply({ embeds: [embed], flags: 64 });
        }

        return { foundUser, embed };
    },

    /**
     * 
     * @param {Bet} bet 
     * @param {*} playerId1 
     * @param {*} playerId2 
     * @param {ButtonInteraction} interaction 
     */
    async createPlayersProfile(bet, playerId1, playerId2, interaction) {
        const member1 = interaction.guild.members.cache.get(playerId1);
        const member2 = interaction.guild.members.cache.get(playerId2);

        const player1Profile = await User.findOneAndUpdate(
            { "player.id": playerId1 }, // Search condition
            {
                $setOnInsert: { // Only applies if creating a new user
                    player: { name: member1.displayName, id: playerId1 },
                }
            },
            { new: true, upsert: true } // Return updated document & create if not found
        );
        const player2Profile = await User.findOneAndUpdate(
            { "player.id": playerId2 }, // Search condition
            {
                $setOnInsert: { // Only applies if creating a new user
                    player: { name: member2.displayName, id: playerId1 },
                }
            },
            { new: true, upsert: true } // Return updated document & create if not found
        );
        player1Profile.betsPlayed.push(bet._id);
        player2Profile.betsPlayed.push(bet._id);
        player1Profile.save();
        player2Profile.save();

        return { player1Profile, player2Profile };
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