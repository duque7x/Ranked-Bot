const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    Colors,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
const Bet = require("../structures/database/bet");
const User = require("../structures/database/User");
const myColours = require("../structures/colours");

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
            existingUser.credit += parseInt(amount);
            existingUser.isAdmin = user.permissions.has(PermissionFlagsBits.Administrator);
            bet.status = "won";

            await existingUser.save();
            option ? console.log("No save bet") : await bet.save();

            winLogChannel.send({ embeds: [logEmbed] });
            return { embed, logEmbed };
        }

        const winnerUserProfile = new User({
            player: { name: user.user.username, id: userId },
            credit: 0,
            isAdmin: user.permissions.has(PermissionFlagsBits.Administrator)
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
    interaction.channel.send({ content: `Aposta criada em ${channelToSend}`, flags: 64 });
}