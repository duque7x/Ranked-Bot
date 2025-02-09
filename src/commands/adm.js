const { 
    EmbedBuilder, 
    PermissionFlagsBits, 
    Colors, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    StringSelectMenuBuilder 
} = require("discord.js");
const Bet = require("../structures/database/bet");

module.exports = {
    name: "adm", // Command name

    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const amounts = [1, 2, 3, 5, 7, 10, 25, 50, 100];
        const categories = [
            { name: "🚩│ APOSTAS EMU", id: "emu" },
            { name: "🚩│ APOSTAS MISTAS", id: "mistas" },
            { name: "🚩│ APOSTAS MOB", id: "mob" }
        ];

        // Create categories and channels
        for (const category of categories) {
            const categoryChannel = await message.guild.channels.create({
                name: category.name,
                type: 4
            });

            for (let i = 0; i < 4; i++) {
                const channelName = `🩸・${i + 1}v${i + 1}・${category.id}`;
                const channel = await message.guild.channels.create({
                    name: channelName,
                    type: 0, // Text channel
                    parent: categoryChannel.id,
                    permissionOverwrites: [
                        {
                            id: message.guildId,
                            deny: [PermissionFlagsBits.SendMessages]
                        }
                    ]
                });

                // Create bets in the channel
                for (const amount of amounts) {
                    await this.createBet(message, channel, amount, client);
                }
            }
        }
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
                }
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
    }
};
