const { SlashCommandBuilder, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require("discord.js");
const Bet = require("../structures/database/bet");
const Config = require("../structures/database/configs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bet")
        .setDescription("Cria uma aposta com um tipo e canal específico.")
        .addStringOption(option =>
            option.setName("tipo")
                .setDescription("O tipo de aposta (ex: 4v4, 4x4).")
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName("canal")
                .setDescription("O canal onde a aposta será enviada.")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("quantidade")
                .setDescription("Valor da aposta (€).")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const { guildId, user, options, guild } = interaction;

        const betType = options.getString("tipo");
        const channelToSend = options.getChannel("canal");
        const amount = options.getInteger("quantidade") ?? 1;
        const userId = user.id;

        const serverConfig = await Config.findOne({ "guild.id": guildId }) 
            ?? new Config({ guild: { id: guildId, name: guild.name }, state: { bets: { status: "on" }, rank: { status: "on" } } });

        if (serverConfig.state.bets.status === "off") {
            return interaction.reply({ content: "-# As apostas estão fechadas no momento!", flags: 64 });
        }

        if (!["1x1", "2x2", "3x3", "4x4", "5x5", "6x6", "1v1", "2v2", "3v3", "4v4", "5v5", "6v6"].includes(betType)) {
            return interaction.reply({ content: "-# Tipo de aposta inválido!", flags: 64 });
        }

        if (amount <= 0) {
            return interaction.reply({ content: "-# O valor da aposta precisa ser um número positivo!", flags: 64 });
        }

        const activeBet = await Bet.findOne({ players: userId });

        const restrictedUsers = ["877598927149490186", "1323068234320183407", "1031313654475395072"];

        if (activeBet && activeBet.status !== "off" && !restrictedUsers.includes(userId)) {
            const channelIdActive = activeBet.betChannel?.id ? activeBet.betChannel.id : "";
            return interaction.reply({ content: `-# Você já está em outra aposta! <#${channelIdActive}>`, flags: 64 });
        }

        try {
            // Criar e salvar a aposta no MongoDB
            const newBet = new Bet({
                betType,
                amount,
                betChannel: {
                    id: channelToSend.id,
                    name: channelToSend.name
                }
            });

            await newBet.save();

            console.log("Bet criada: betID", newBet._id);

            await sendBetEmbed(channelToSend, betType, newBet, amount);
            interaction.reply({ content: "-# Aposta criada com sucesso!", flags: 64 });

        } catch (err) {
            console.error("Erro ao criar aposta:", err);
            interaction.reply({ content: "-# Ocorreu um erro ao criar a aposta!", flags: 64 });
        }
    }
};

/**
 * Envia o embed da aposta.
 * @param {import("discord.js").TextChannel} channelToSend 
 * @param {string} betType 
 * @param {Bet} betData 
 * @param {number} amount 
 */
async function sendBetEmbed(channelToSend, betType, betData, amount) {
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
        .addOptions(
            { label: "Iniciar aposta", value: "start_bet_value" },
            { label: "Voltar", value: "go_back" }
        );

    const row1 = new ActionRowBuilder().addComponents(enterBet, outBet);
    const row2 = new ActionRowBuilder().addComponents(selectMenu);

    await channelToSend.send({ embeds: [embed], components: [row2, row1] });
}
