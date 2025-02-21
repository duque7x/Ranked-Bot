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
    async addWins(userId, interaction, option, optAmount) {
        const bet = await getBetById(interaction.channel.topic?.replace("Id da aposta: ", ""));
        if (!bet) return this.sendReply(interaction, "Aposta não encontrada.");

        const user = interaction.guild.members.cache.get(userId);
        if (!user) return this.sendReply(interaction, "Usuário inválido.");

        const amount = optAmount ?? bet?.amount ?? 1;
        const parsedAmount = isNaN(parseInt(amount)) ? 0 : parseInt(amount);

        const embed = new EmbedBuilder()
            .setDescription(`# Gerenciador de crédito\nCrédito de **${parsedAmount}€** foi adicionado a <@${userId}>!`)
            .setColor(myColours.bright_blue_ocean)
            .setTimestamp();

        const logEmbed = new EmbedBuilder()
            .setDescription(`# Gerenciador de crédito\nCrédito de **${parsedAmount}€** foi adicionado a <@${userId}>!`)
            .setColor(myColours.bright_blue_ocean || "#0099ff")
            .setTimestamp()
            .addFields(
                { name: "ID da aposta:", value: bet?._id?.toString() ?? "ID inválido" },
                { name: "Valor ganho", value: `${parsedAmount}€` },
                { name: "Canal da aposta", value: bet?.betChannel?.id ? `<#${bet.betChannel.id}>` : "Canal inválido" }
            );

        const winLogChannel = interaction.guild.channels.cache.get("1339329876662030346");


        const existingUser = await User.findOne({ "player.id": userId });

        if (existingUser) {
            // Ensure that wins is a number, default to 0 if it's NaN
            existingUser.wins = isNaN(existingUser.wins) ? 0 : existingUser.wins;

            existingUser.credit += parseInt(amount);
            existingUser.isAdmin = user.permissions.has(PermissionFlagsBits.Administrator);
            existingUser.wins += 1; // Increment wins

            bet.status = "won";

            await existingUser.save();
            option ? console.log("No save bet") : await bet.save();

            winLogChannel.send({ embeds: [logEmbed] });
            return { embed, logEmbed };
        }


        const winnerUserProfile = new User({
            player: { name: user.user.username, id: userId },
            credit: 0,
            isAdmin: user.permissions.has(PermissionFlagsBits.Administrator),
            wins: 1
        });

        winnerUserProfile.credit += parsedAmount;
        winnerUserProfile.isAdmin = user.permissions.has(PermissionFlagsBits.Administrator);
        await winnerUserProfile.save();

        await winLogChannel.send({ embeds: [logEmbed] });

        option ? console.log("No save status") : bet.status = "won";
        option ? console.log("No save winner") : bet.winner = userId;
        option ? console.log("No save bet") : await bet.save();

        return { logEmbed, embed };
    },
    async addLoss(member, interaction) {
        if (!member) return this.sendReply(interaction, "Membro inválido.");

        // First, attempt to find and update the user with an initial value for losses (if necessary)
        const userProfile = await User.findOneAndUpdate(
            { "player.id": member.id },
            {
                $setOnInsert: {
                    isAdmin: member.permissions.has(PermissionFlagsBits.Administrator),
                    losses: 0 // Initialize losses to 0 if the document doesn't exist
                }
            },
            { upsert: true, new: true }
        );
        console.log(userProfile);
        // Then increment the losses
        userProfile.losses += 1; // Increment losses by 1
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
    async removeWin(userId, amount, interaction, option) {
        const user = interaction.guild.members.cache.get(userId);

        const bet = await getBetById(interaction.channel.topic.replace("Id da aposta: ", ""));
        amount = amount ?? 1;

        if (!bet) return this.sendReply(interaction, "# Essa aposta foi fechada!");
        const embed = new EmbedBuilder()
            .setDescription(`# Gerenciador de crédito\nCrédito de **${amount}€** foi removido de <@${userId}>!`)
            .setColor(Colors.DarkRed)
            .setTimestamp();

        const logEmbed = new EmbedBuilder()
            .setDescription(`# Gerenciador de crédito\nCrédito de **${amount}€** foi removido de <@${userId}>!`)
            .setColor(Colors.DarkRed)
            .setTimestamp()
            .addFields(
                { name: "ID da aposta:", value: bet._id ? bet._id.toString() : "ID inválido" },
                { name: "Valor removido", value: amount && !isNaN(amount) ? `${amount}€` : "Valor inválido" },
                { name: "Canal da aposta", value: `<#${bet.betChannel.id}>` }
            )
            .setFooter({ text: `Por ${interaction.user.username}` });

        const winLogChannel = interaction.guild.channels.cache.get("1339329876662030346");
        const existingUser = await User.findOne({ "player.id": userId });

        if (existingUser) {
            existingUser.credit = parseInt(existingUser.credit) - parseInt(amount);
            existingUser.isAdmin = user.permissions.has(PermissionFlagsBits.Administrator);
            bet.status = "started";

            await existingUser.save();
            await bet.save();

            winLogChannel.send({ embeds: [logEmbed] });
            return { embed, logEmbed };
        }

        const winnerUserProfile = new User({
            player: { name: user.user.username, id: userId },
            credit: 0,
            isAdmin: user.permissions.has(PermissionFlagsBits.Administrator)
        });

        await winnerUserProfile.save();
        winLogChannel.send({ embeds: [logEmbed] });
        bet.status = "started";
        if (!option) {
            bet.winner = "";
            bet.save();
        }
        await bet.save();

        return { logEmbed, embed };
    },
    async returnServerRank(interaction) {
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
    
        const users = await User.find().sort({ wins: -1 });
        const perPage = 10;
        let page = 0;
    
        const generateEmbed = () => {
            const start = page * perPage;
            const paginatedUsers = users.slice(start, start + perPage);
    
            return new EmbedBuilder()
                .setTitle("Ranking de vitórias")
                .setDescription(paginatedUsers.map((user, index) =>
                    `**${start + index + 1}° -** <@${user.player.id}>: ${user.wins ?? 0} vitórias`
                ).join("\n"))
                .setFooter({ text: `Página ${page + 1}` });
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
    
        // Enviando a interação com a resposta e componentes usando withResponse
        const message = await interaction.reply({ 
            embeds: [generateEmbed()], 
            components: [row()],
            fetchReply: true, // Corrigido para withResponse
            flags: 64 
        });
    
        // Coletor de interações para os botões
        const collector = message.createMessageComponentCollector({ time: 120000 });
    
        collector.on("collect", async (btnInteraction) => {
            if (btnInteraction.customId === "prev") page--;
            if (btnInteraction.customId === "next") page++;
    
            await btnInteraction.update({ embeds: [generateEmbed()], components: [row()] });
        });
    
        return { embed: generateEmbed() };
    },
    
    
    /**
     * 
     * @param {ButtonInteraction} interaction 
     * @returns 
     */
    async returnUserRank(interaction) {
        const { user } = interaction;
        const foundUser = await User.findOne({ "player.id": user.id });

        if (!foundUser) {
            return this.sendReply(interaction, "# Este usuário ainda não foi registrado.");
        }
        const color = await getColorFromURL(user.displayAvatarURL());

        const embed = new EmbedBuilder()
            .setAuthor({
                name: `Perfil de ${user.username}`,
                iconURL: user.displayAvatarURL()
            })
            .setColor(color)
            .addFields({
                name: "Estatísticas",
                value:
                    `\n**Vitórias:** ${foundUser.wins ?? 0} ︱ **Derrotas:** ${foundUser.losses ?? 0}\n` +
                    `**Crédito disponível:** ${foundUser.credit !== 0 ? foundUser.credit : "Nenhum"}€ ︱ **Vezes jogadas:** ${foundUser.betsPlayed.length ?? 0}\n` +
                    `**Blacklist:** ${foundUser.blacklisted ? "Sim" : "Não"} ︱ **Dinheiro perdido:** ${foundUser.moneyLost ?? 0}€`
            })
            .setThumbnail(user.displayAvatarURL());

        return interaction.reply({ embeds: [embed], flags: 64 });
    }
};

async function getBetById(betId) {
    const bet = await Bet.findById(betId);
    if (!bet) return this.sendReply(interaction, "# Esta aposta não existe!");
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