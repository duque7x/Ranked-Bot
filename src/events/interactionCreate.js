
const {
    ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder,
    Interaction, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle,
    ChannelType, PermissionFlagsBits,
    Client
} = require('discord.js');
const BotClient = require("../index");
const Bet = require("../structures/database/bet");
const User = require('../structures/database/User');
const Config = require('../structures/database/configs');
const addWins = require("../commands/utils").addWins;
const myColours = require("../structures/colours");

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
            const [action, betType, betId, ammount] = interaction.customId.split("-");
            const userId = interaction.user.id;
            const { guildId, guild, member, channel, customId } = interaction;
            if (action === "enter_bet") {
                let serverConfig = await Config.findOne({ "guild.id": guildId });
                if (!serverConfig) {
                    serverConfig = new Config({
                        guild: { id: guildId, name: guild.name },
                        state: { bets: { status: "on" }, rank: { status: "on" } }
                    });

                    await serverConfig.save();
                }

                if (serverConfig.state.bets.status == "off") return this.sendReply(interaction, "# As apostas estão fechadas no momento!");

                const activeBet = await Bet.findOne({ players: userId });

                const restrictedUsers = serverConfig.blacklist;

                if (restrictedUsers.includes(interaction.user.id)) return interaction.reply({ content: "Você está na *blacklist*!\nDeseja sair? Abra um ticket <#1339284682902339594>", flags: 64 });

                if (activeBet && activeBet.status[0] !== "off") {
                    const channelIdActive = activeBet.betChannel?.id ? activeBet.betChannel?.id : "";
                    return interaction.reply({ content: `# ❌ Você já está em outra aposta! <#${channelIdActive}>`, flags: 64 });
                }

                let bet = await Bet.findById(betId);

                if (!bet) {
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
                let errorTypes = [];

                // Check all potential errors and add corresponding types to the array
                if (!bet || bet.status[0] == "off") errorTypes.push('bet_off');
                if (!bet.players?.includes(userId)) errorTypes.push('bet_not_in');

                // If there are errors, return them all in a single response
                if (errorTypes.length > 0) return this.returnErrorToMember(interaction, errorTypes);
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

                if (!bet || bet.status[0] === "off") return interaction.reply({ content: "# Essa aposta foi fechada!", flags: 64 });
                if (bet.status[0] === "started") return interaction.reply({ content: "# Essa aposta já foi iniciada! " + bet._id, flags: 64 });
                if (handler[value]) return await handler[value](bet, client, interaction);

            }
            if (customId.startsWith("end_bet-")) {
                const [action, betId] = customId.split("-");
                const bet = await this.getBetById(betId);

                if (!bet.winner) return this.sendReply(interaction, "# Você precisa definir o vencedor!");

                return this.endBet(bet, client, interaction);
            }
            if (customId.startsWith("set_winner")) {
                const [action, betId] = customId.split("-");
                const bet = await this.getBetById(betId);

                if (bet.winner) return this.sendReply(interaction, "# Esta aposta já tem um ganhador!\n-# Foi um engano?\n-# Chame um ADM para o ajudar.");

                const setWinnerEmbed = new EmbedBuilder()
                    .setColor(myColours.rich_black)
                    .setDescription(`# Adicionar o vencedor da aposta!\n-# Caso o vencedor foi mal selecionado, por favor chame um dos nossos ADMs!`)
                    .setFooter({ text: "Nota: Clicar no ganhador errado de propósito resultara em castigo de 2 semanas!" });

                const team1Btn = new ButtonBuilder().setCustomId(`btn_set_winner-${bet._id}-team1`).setLabel("Time 1 vencedor").setStyle(ButtonStyle.Secondary);
                const team2Btn = new ButtonBuilder().setCustomId(`btn_set_winner-${bet._id}-team2`).setLabel("Time 2 vencedor").setStyle(ButtonStyle.Secondary);

                const row = new ActionRowBuilder().addComponents(team1Btn, team2Btn);

                interaction.reply({ embeds: [setWinnerEmbed], components: [row] })
            }
            if (customId.startsWith("btn_set_winner")) {
                const [action, betId, team] = customId.split("-");
                const bet = await this.getBetById(betId);

                if (!bet) return this.sendReply(interaction, "# Esta aposta não exite!");
                if (bet.winner) return this.sendReply(interaction, "# Esta aposta já tem um ganhador!\n-# Foi um engano?\n-# Chame um ADM para o ajudar. **MANDE PROVAS!**");

                const winnerTeam = parseInt(team.replace("team", "")) === 1 ? 0 : 1;
                const winingPlayer = bet.players[winnerTeam];
                const winningUser = interaction.guild.members.cache.get(winingPlayer);

                console.log(`Player ${winningUser.user.username}|${winningUser.user.id} won the bet: ${betId}.`);

                const addedWinObj = await addWins(winningUser.id, interaction, bet);
                console.log(addedWinObj);

                if (!addedWinObj) return this.sendReply(interaction, "# Ocorreu um erro ao processar a aposta.");

                bet.winner = bet.players[winnerTeam];
                bet.save();
                if (interaction.replied || interaction.deferred) {
                    return interaction.followUp({ embeds: [addedWinObj.embed] }).catch(console.error);
                } else {
                    return interaction.reply({ embeds: [addedWinObj.embed] }).catch(console.error);
                }

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
    async returnErrorToMember(interaction, errorTypes) {
        const errorMessages = {
            'bet_off': "# Essa aposta foi fechada!\n-# Aguarde antes de tentar novamente.",
            'bet_started': "# A aposta já foi iniciada.\n-# Aguarde a conclusão antes de tentar novamente.",
            'bet_won': "# Esta aposta já tem um ganhador!\n-# Foi um engano?\n-# Chame um ADM para o ajudar. **MANDE PROVAS!**",
            'blacklist': "# Você está na *blacklist*!\n-# Deseja sair? Abra um ticket <#1339284682902339594>",
            'bet_in': "# Você já está na aposta...",
            'bet_full': "# A aposta já está cheia!",
            'bet_not_full': "# A aposta não está preenchida!",
            'bet_not_in': "# Você não se encontra nesta aposta!",
            'bet_no_winner': "# Você precisa definir o vencedor!",
            'bets_off': "# As apostas estão fechadas no momento!\n-# Aguarde antes de tentar novamente.",
        };

        // Collect all error messages for each errorType
        const messages = errorTypes.map(type => errorMessages[type] || "Erro desconhecido. Tente novamente.");

        // Join all error messages with a line break
        const message = messages.join('\n\n');  // Adds a newline between multiple errors

        // Send the error messages as a reply
        return this.sendReply(interaction, message);
    }

    goBack(bet, client, interaction) {
        return this.sendReply(interaction, "# Voltando, selecione a opcao de iniciar quando a aposta estiver cheia.")
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
        if (bet.status[0] == "off") return this.sendReply(interaction, "# Esta aposta já esta fechada!");

        const channel = await client.channels.fetch(bet.betChannel.id);
        if (!channel) return console.error("Erro: O canal não foi encontrado.");
        bet.status = ["off"];
        await bet.save();

        await channel.edit({
            name: "🔒・" + channel.name,
            permissionOverwrites: [
                {
                    id: interaction.guild.id, // @everyone
                    deny: [PermissionFlagsBits.ViewChannel] // Hide from everyone
                },
                ...bet.players.filter(Boolean).map(playerId => ({
                    id: playerId,
                    deny: [PermissionFlagsBits.SendMessages]
                })),
                {
                    id: "1336838133030977666", // @everyone (default permissions)
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] // Hide from everyone
                },
                {
                    id: "1339009613105856603", // @everyone (default permissions)
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] // Hide from everyone
                }
            ],
            parent: "1337588697280942131"
        });
        const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
            .setDescription(`## Aposta fechada\nObrigado por jogar na **BLOOD APOSTAS 🩸**\n\n-# Volte sempre.`)
            .setColor(myColours.eerie_black_green)
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
        const replaceOldBet = require("../commands/utils");
        replaceOldBet.createBet(interaction, interaction.channel, bet.amount, client);

        const channel = await this.createBetChannel(interaction, bet);


        bet.betChannel = { id: channel.id, name: channel.name };

        bet.status = ["started"];

        await bet.save();


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
            parent: "1339324693110329458",
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
                },
                {
                    id: "1336838133030977666", // @everyone (default permissions)
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] // Hide from everyone
                },
                {
                    id: "1339009613105856603", // @everyone (default permissions)
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] // Hide from everyone
                }
            ]
        });

        const embed = new EmbedBuilder()
            .setColor(myColours.gun_metal)
            .setDescription(`# Aposta ${bet.betType}\n> Aposta criada com sucesso, vá para o [canal](https://discord.com/channels/1336809872884371587/${channel.id}) e consulte as informações.`)
            .setTimestamp();


        bet.betChannel = { id: channel.id, name: channel.name };
        await bet.save();

        interaction.message.delete();

        const embedForChannel = new EmbedBuilder()
            .setColor(myColours.rich_black)
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
        await interaction.replied || interaction.deferred
            ? interaction.followUp({ embeds: [embed], flags: 64 })
            : interaction.reply({ embeds: [embed], flags: 64 });
        return channel;
    }
    async getBetById(betId) {
        const bet = await Bet.findById(betId);
        if (!bet) return this.sendReply(interaction, "# Esta aposta não existe!");
        return bet;
    }


};
