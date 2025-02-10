const {
    ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder,
    Interaction, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle,
    ChannelType, PermissionFlagsBits,
    Client
} = require('discord.js');
const BotClient = require("../index");
const Bet = require("../structures/database/bet");
const User = require('../structures/database/User');
const addWins = require("../commands/utils").addWins;
module.exports = class InteractionEvent {
    constructor(client) {
        this.name = 'interactionCreate';
    }

    /**
     * @param {Interaction} interaction 
     * @param {BotClient} client 
     * @returns 
     */
    async execute(interaction, client) {
        try {
            const { customId } = interaction;
            const [action, betType, betId, ammount] = interaction.customId.split("-");
            const userId = interaction.user.id;
            if (action === "enter_bet") {
                const activeBet = await Bet.findOne({ players: userId });

                const restrictedUsers = ["877598927149490186", "1323068234320183407", "1031313654475395072"];


                if (activeBet && (activeBet.status[0] !== "off") && !restrictedUsers.includes(userId)) {
                    const channelIdActive = activeBet.betChannel?.id ? activeBet.betChannel?.id : "";
                    return interaction.reply({ content: `# ❌ Você já está em outra aposta! <#${channelIdActive}>`, flags: 64 });
                }


                let bet = await Bet.findById(betId);

                if (!bet || bet.status[0] === "off") {
                    return interaction.reply({ content: "# Essa aposta foi fechada!", flags: 64 });
                }

                let team1 = bet.players[0] || null;
                let team2 = bet.players[1] || null;

                if (bet.players.includes(userId)) {
                    return interaction.reply({ content: "# ✅ Você já está na aposta!", flags: 64 });
                }

                if (!team1) {
                    team1 = userId;
                } else if (!team2) {
                    team2 = userId;
                } else {
                    return interaction.reply({ content: "# ✔️ A aposta já está cheia!", flags: 64 });
                }

                bet.players = [team1, team2].filter(Boolean);
                await bet.save();

                const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                    .setDescription(`## Aposta **${betType}** | ${bet.amount}€\n> Jogadores entrando! Aguarde a partida começar.`)
                    .setColor(Colors.White)
                    .setFields([
                        {
                            name: "Equipe 1",
                            value: team1 ? `<@${team1}>` : "Slot vazio",
                            inline: true
                        },
                        {
                            name: "Equipe 2",
                            value: team2 ? `<@${team2}>` : "Slot vazio",
                            inline: true
                        }
                    ]);
                return await interaction.update({ embeds: [updatedEmbed] });
            }

            if (action === "out_bet") {
                let bet = await Bet.findById(betId);
                if (!bet || bet.status[0] == "off") return this.sendReply(interaction, "# Essa aposta foi fechada!");
                if (!bet.players?.includes(userId)) return this.sendReply(interaction, "# Você não se encontra nesta aposta!");

                // Remover jogador e salvar aposta
                bet.players = this.removeItemOnce(bet.players, userId);
                await bet.save();

                // Capturar os jogadores restantes
                const [team1, team2] = bet.players;

                // Atualizar embed
                const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0]).setFields([
                    { name: "Equipe 1", value: team1 ? `<@${team1}>` : team2 ? `<@${team2}>` : "Slot vazio", inline: true },
                    { name: "Equipe 2", value: team2 ? `<@${team2}>` : "Slot vazio", inline: true }
                ]);

                return await interaction.update({ embeds: [updatedEmbed] });
            }
            if (customId.startsWith("select_menu")) {
                const [action, betType, betId] = interaction.customId.split("-");
                const value = interaction.values[0];
                const handler = {
                    start_bet_value: this.startBet.bind(this),
                    go_back: this.goBack.bind(this)
                };
                let bet = await Bet.findById(betId);

                if (!bet || bet.status[0] === "off") {
                    return interaction.reply({ content: "# Essa aposta foi fechada!", flags: 64 });
                }
                if (bet.status[0] === "started") return interaction.reply({ content: "# Essa aposta já foi iniciada! " + bet._id, flags: 64 });
                if (handler[value]) {
                    await handler[value](bet, client, interaction);
                    bet.status = "started";
                    await bet.save();
                    return;
                }
                return
            }
            if (customId.startsWith("end_bet-")) {
                if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return this.sendReply(interaction, "# Você não tem as permissões necessárias!");
                const [action, betId] = customId.split("-");
                const bet = await Bet.findOne({ "_id": betId });

                if (!bet) return this.sendReply(interaction, "# Esta aposta não existe!");
                if (!bet.winner) return this.sendReply(interaction, "# Você precisa definir o vencedor!");

                return this.endBet(bet, client, interaction);
            }
            if (customId.startsWith("set_winner")) {
                const [action, betId] = customId.split("-");
                const bet = await Bet.findOne({ "_id": betId });

                if (!bet) return this.sendReply(interaction, "# Esta aposta não existe!");

                const team1Btn = new ButtonBuilder().setCustomId(`btn_set_winner-${bet._id}-team1`).setLabel("Time 1 vencedor").setStyle(ButtonStyle.Secondary);
                const team2Btn = new ButtonBuilder().setCustomId(`btn_set_winner-${bet._id}-team2`).setLabel("Time 2 vencedor").setStyle(ButtonStyle.Secondary);

                const row = new ActionRowBuilder().addComponents(team1Btn, team2Btn);

                return interaction.replied || interaction.deferred
                    ? interaction.followUp({ components: [row], flags: 64 })
                    : interaction.reply({ components: [row], flags: 64 });
            }
            if (customId.startsWith("btn_set_winner")) {
                const [action, betId, team] = customId.split("-");
                const bet = await Bet.findOne({ "_id": betId });


                if (!bet) return this.sendReply(interaction, "# Esta aposta nao exite!");
                if (bet.winner) return this.sendReply(interaction, "# Esta aposta ja tem um ganhador! Foi um engano? Chame um adm para o ajudar.");

                const winnerTeam = parseInt(team.replace("team", "")) === 1
                    ? 0
                    : 1;
                const winingPlayer = bet.players[winnerTeam];
                const winningUser = interaction.guild.members.cache.get(winingPlayer);

                console.log({ team, winnerTeam, winingPlayer });
                bet.winner = bet.players[winnerTeam];
                bet.save();

                addWins(winingPlayer, 1, interaction);
            }
        } catch (error) {
            console.error("Erro inesperado no evento interactionCreate:", error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.", flags: 64 });
            } else {
                await interaction.reply({ content: "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.", flags: 64 });
            }
        }
    }
    goBack(bet, client, interaction) {
        this.sendReply(interaction, "# Voltando, selecione a opcao de iniciar quando a aposta estiver cheia.")
    }
    /**
     * 
     * @param {Bet} bet 
     * @param {Client} client
     * @param {Interaction} interaction 
     * @returns 
     */
    async endBet(bet, client, interaction) {
        if (!bet) return this.sendReply(interaction, "# ❌ Nenhuma aposta encontrada com esse ID.");
        if (bet.status[0] == "off") return this.sendReply(interaction, "# Esta aposta ja esta fechada!");

        const channel = await client.channels.fetch(bet.betChannel.id);
        if (!channel) return console.error("Erro: O canal não foi encontrado.");
        bet.status = "off";
        await bet.save();

        await channel.edit({
            name: "closed-" + channel.name,
            permissionOverwrites: [
                {
                    id: interaction.guild.id, // @everyone
                    deny: [PermissionFlagsBits.ViewChannel] // Hide from everyone
                },
                ...bet.players.filter(Boolean).map(playerId => ({
                    id: playerId,
                    deny: [PermissionFlagsBits.SendMessages]
                }))
            ],
            parent: "1337588697280942131"
        });
        const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
            .setDescription(`## Aposta fechada\nObrigado por jogar na **BLOOD APOSTAS 🩸**! Volte sempre.`)
            .setColor(Colors.DarkAqua)
            .setFields();

        return await interaction.update({ embeds: [updatedEmbed], components: [], content: "" });
    }
    /**
     * 
     * @param {Bet} bet 
     * @param {Client} client 
     * @param {Interaction} interaction
     * @returns 
     */
    async startBet(bet, client, interaction) {
        if (bet.players.length !== 2) return this.sendReply(interaction, "# A aposta não está preenchida!");
        const channel = await this.createBetChannel(interaction, bet);
        const replaceOldBet = require("../commands/utils");

        bet.betChannel = { id: channel.id, name: channel.name };
        await bet.save();

        replaceOldBet.createBet(interaction, interaction.channel, bet.amount, client);

        return channel;
    }
    sendReply(interaction, content) {
        return interaction.replied || interaction.deferred
            ? interaction.followUp({ content, flags: 64 })
            : interaction.reply({ content, flags: 64 });
    }
    removeItemOnce(arr, value) {
        var index = arr.indexOf(value);
        if (index > -1) {
            arr.splice(index, 1);
        }
        return arr;
    }
    /**
     * Creates a private bet channel
     * @param {Interaction} interaction 
     * @param {Bet} bet 
     */
    async createBetChannel(interaction, bet) {
        const { guild } = interaction;
        const totalBets = await Bet.countDocuments();
        const formattedTotalBets = String(totalBets).padStart(3, '0');

        const channel = await guild.channels.create({
            name: `aposta-${formattedTotalBets}`,
            parent: interaction.channel.parentId,
            type: ChannelType.GuildText,
            topic: `Id da aposta: ${bet._id}`,
            permissionOverwrites: [
                {
                    id: guild.id, // @everyone (default permissions)
                    deny: [PermissionFlagsBits.ViewChannel] // Hide from everyone
                },
                {
                    id: bet.players[0], // First player
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                },
                {
                    id: bet.players[1], // Second player
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                }
            ]
        });
        const embed = new EmbedBuilder()
            .setColor(0xff9933)
            .setDescription(`# Aposta ${bet.betType}\n> Aposta criada com sucesso, vá para o [canal](https://discord.com/channels/1336809872884371587/${channel.id}) e consulte as informações.`)
            .setTimestamp();


        bet.betChannel = { id: channel.id, name: channel.name };
        await bet.save();
        await interaction.replied || interaction.deferred
            ? interaction.followUp({ embeds: [embed], flags: 64 })
            : interaction.reply({ embeds: [embed], flags: 64 });

        interaction.message.delete();

        const embedForChannel = new EmbedBuilder()
            .setColor(0xff9933)
            .setDescription(`# Aposta ${bet.betType}: valor ${bet.amount}€\n> Converse com um dos nossos mediadores para avançar com a aposta.`)
            .addFields([
                {
                    name: "Equipa 1",
                    value: `<@${bet.players[0]}>`,
                    inline: true
                },
                {
                    name: "Equipa 2",
                    value: `<@${bet.players[1]}>`,
                    inline: true
                }
            ])
            .setTimestamp();

        const endBet = new ButtonBuilder()
            .setCustomId(`end_bet-${bet._id}`)
            .setLabel("Encerrar aposta")
            .setStyle(ButtonStyle.Danger);
        const setWinner = new ButtonBuilder()
            .setCustomId(`set_winner-${bet._id}`)
            .setLabel("Definir ganhador")
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(setWinner, endBet);

        channel.send({
            content: `<@&1336838133030977666>, <@${bet.players[0]}>, <@${bet.players[1]}>`,
            embeds: [embedForChannel],
            components: [row]
        });
        return channel;
    }
};

