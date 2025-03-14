
const {
    ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder,
    Interaction, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle,
    ChannelType, PermissionFlagsBits,
    Client,
    ButtonInteraction, ThreadAutoArchiveDuration,
} = require('discord.js');
const BotClient = require("../index");
const Bet = require("../structures/database/bet");
const User = require('../structures/database/User');
const Config = require('../structures/database/configs');
const { setBetWinner, addLossWithAmount, returnServerRank, returnUserRank, errorMessages, startBet } = require("../utils/utils");
const myColours = require("../structures/colours");
const Embeds = require("../structures/embeds/Embeds");

module.exports = class InteractionEvent {
    constructor(client) {
        this.name = 'interactionCreate';
    }
    /**
     * @param {ButtonInteraction} interaction 
     * @param {BotClient} client 
     * @returns 
     */
    async execute(interaction, client) {
        if (interaction.user.bot) return;
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                return await command.execute(interaction, client);
            } catch (error) {
                console.error(error);
                return this.sendReply(interaction, "Erro ao executar o comando.");
            }
        }
        try {
            let [action, betType, betId, amount] = interaction.customId.split("-");
            let userId = interaction.user.id;
            let { guildId, guild, member, customId } = interaction;
            let logChannel = interaction.guild.channels.cache.get("1340360434414522389") || interaction.channel;
            let serverConfig = await Config.findOneAndUpdate(
                { "guild.id": interaction.guild.id },  // Find the document by guild ID
                { $setOnInsert: { guild: { name: interaction.guild.name, id: interaction.guild.id } } },  // Only set this if the document doesn't exist
                { new: true, upsert: true }  // Return the updated document, and create one if it doesn't exist
            );

            if (action === "enter_bet") {
                await interaction.deferUpdate({ flags: 64 });
                let [action, betType, betId, amount] = interaction.customId.split("-");

                let [activeBets, bet] = await Promise.all([
                    Bet.find({ players: userId }), // Returns an array
                    Bet.findOne({ "_id": betId })
                ]);

                // Find active bets (not "off")
                let ongoingBets = activeBets.filter(b => b.status !== "off").sort((a, b) => b.createdAt - a.createdAt);;


                // If the user has an active bet, prevent them from joining another
                if (ongoingBets.length > 0 && userId !== "877598927149490186") {
                    let msg = [];
                    const n = ongoingBets.forEach(bet => msg.push(bet._id));

                    return this.sendReply(interaction, `# Você já está em outra aposta! <#${ongoingBets[0].betChannel?.id || ""}>\n-# Id da aposta(s): ${ongoingBets.length > 1 ? msg.join(", ") : ongoingBets[0]._id}\n-# Chame um ADM se esta tendo problemas.`);
                }

                if (!bet) return this.sendReply(interaction, errorMessages.bet_off);
                if (serverConfig.state.bets.status === "off") return interaction.followUp({ embeds: [Embeds.betsOff], flags: 64 });
                if (serverConfig.blacklist.some(id => id.startsWith(userId))) return this.sendReply(interaction, errorMessages.blacklist);
                if (bet.players.includes(userId)) return this.sendReply(interaction, `# Você já está na aposta!\n-# Id da aposta(s): ${bet._id}\n-# Chame um ADM se esta tendo problemas.`);


                if (bet.players.length >= 2) return this.sendReply(interaction, errorMessages.bet_full);

                bet.players.push(userId);
                await bet.save();

                const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
                    .setDescription(`## Aposta **${betType}** | ${bet.amount}€\n> Jogadores entrando! Aguarde a partida começar.`)
                    .setColor(Colors.White)
                    .setFields([
                        { name: "Equipe 1", value: bet.players[0] ? `<@${bet.players[0]}>` : "Slot vazio", inline: true },
                        { name: "Equipe 2", value: bet.players[1] ? `<@${bet.players[1]}>` : "Slot vazio", inline: true }
                    ]);

                await interaction.message.edit({ embeds: [updatedEmbed] }); // ✅ Best choice for updating only the embed
                await logChannel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`# O jogador <@${userId}> entrou na fila de ${betType}\n-# Id da aposta: ${betId}.`)
                            .setColor(Colors.Aqua)
                            .setTimestamp()
                    ]
                });

                return;
            }
            if (action === "out_bet") {
                let errorTypes = [];
                let bet = await Bet.findOne({ "_id": betId });

                // Check for errors and add to errorTypes array
                if (!bet || bet.status === "off") errorTypes.push('bet_off');
                if (!bet.players?.includes(userId)) errorTypes.push('bet_not_in');

                // If there are errors, return them all in a single response
                if (errorTypes.length > 0) return this.returnErrorToMember(interaction, errorTypes);

                // Ensure bet.players is always an array
                bet.players ??= [];

                // Remove player from the bet
                bet.players = this.removeItemOnce(bet.players, userId);
                await bet.save();

                // Get remaining players
                const [team1, team2] = bet.players;

                // Update embed
                const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0]).setFields([
                    { name: "Equipe 1", value: team1 ? `<@${team1}>` : "Slot vazio", inline: true },
                    { name: "Equipe 2", value: team2 ? `<@${team2}>` : "Slot vazio", inline: true }
                ]);

                await interaction.message.edit({ embeds: [updatedEmbed] });

                // Send log message
                await logChannel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`# O jogador <@${userId}> saiu da fila ${betType}\n-# Id da aposta: ${betId}.`)
                            .setColor(Colors.Red)
                            .setTimestamp()
                    ]
                });

                await interaction.deferUpdate();
                return;
            }

            if (customId.startsWith("select_menu")) {
                const value = interaction.values[0];
                const handler = {
                    start_bet_value: startBet.bind(this),
                    go_back: this.goBack.bind(this)
                };
                let bet = await Bet.findById(betId);
                if (!bet || bet.status === "off") return this.sendReply(interaction, errorMessages.bet_off);
                if (bet.status === "started") return this.sendReply(interaction, errorMessages.bet_started);
                if (handler[value]) return await handler[value](bet, client, interaction);
            }
            if (customId.startsWith("end_bet-")) {
                if (!member?.permissions.has(PermissionFlagsBits.Administrator) && !member.roles.cache.has("1336838133030977666")) return this.sendReply(interaction, "# Você precisa falar com um ADM ou MEDIADOR para fechar a aposta!");
                const [action, betId] = customId.split("-");
                let bet = await Bet.findById(betId);
                if (!bet.winner) return this.sendReply(interaction, errorMessages.bet_no_winner);
                if (!bet) return this.sendReply(interaction, "# Nenhuma aposta encontrada com esse ID.");
                if (bet.status == "off") return this.sendReply(interaction, errorMessages.bet_off);

                return this.endBet(bet, client, interaction);
            }
            if (customId.startsWith("set_winner")) {
                const [action, betId] = customId.split("-");
                let bet = await Bet.findById(betId);
                if (!member?.permissions.has(PermissionFlagsBits.Administrator) && !member.roles.cache.has("1336838133030977666")) return this.sendReply(interaction, "# Você precisa falar com um ADM ou MEDIADOR para definir um vencedor!");
                if (!bet) return this.sendReply(interaction, "# Esta aposta não existe!");
                if (bet.winner) return this.sendReply(interaction, errorMessages.bet_won + `\nId: **${betId}**`);

                const setWinnerEmbed = new EmbedBuilder()
                    .setColor(myColours.rich_black)
                    .setDescription(`# Adicionar o vencedor da aposta!\n-# Caso o vencedor foi mal selecionado, por favor chame um dos nossos ADMs!`)
                    .setFooter({ text: "Nota: Clicar no ganhador errado de propósito resultara em castigo de 2 semanas!" });

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`btn_set_winner-${bet._id}-${bet.players[0]}-${bet.players[1]}`).setLabel("Time 1 vencedor").setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId(`btn_set_winner-${bet._id}-${bet.players[1]}-${bet.players[0]}`).setLabel("Time 2 vencedor").setStyle(ButtonStyle.Secondary)
                );

                interaction.reply({ embeds: [setWinnerEmbed], components: [row] })
            }
            if (customId.startsWith("btn_set_winner")) {
                const [action, betId, winingPlayerId, losingPlayerId] = customId.split("-");

                const bet = await Bet.findOne({ _id: betId });
                if (bet.winner) return this.sendReply(interaction, errorMessages.bet_won + `\nId: **${betId}**`);
                const winningMember = interaction.guild.members.cache.get(winingPlayerId);
                const losingMember = interaction.guild.members.cache.get(losingPlayerId);

                const loserProfile = (await addLossWithAmount(losingPlayerId, interaction, bet));
                const winnerProfile = (await setBetWinner(bet, winningMember)).userProfile;

                !loserProfile.betsPlayed.includes(bet._id) ? loserProfile.betsPlayed.push(bet._id) : console.log("Added bet.");
                !winnerProfile.betsPlayed.includes(bet._id) ? winnerProfile.betsPlayed.push(bet._id) : console.log("Added bet.");

                loserProfile.save();
                winnerProfile.save();
                const logEmbed = new EmbedBuilder()
                    .setDescription(`# Gerenciador de crédito\nCrédito de **${bet.amount}€** foi adicionado a <@${userId}>!`)
                    .setColor(myColours.bright_blue_ocean || "#0099ff")
                    .setTimestamp()
                    .addFields(
                        { name: "ID da aposta:", value: bet?._id?.toString() ?? "ID inválido" },
                        { name: "Valor ganho", value: `${bet.amount}€` },
                        { name: "Canal da aposta", value: bet?.betChannel?.id ? `<#${bet.betChannel.id}>` : "Canal inválido" }
                    );

                const winLogChannel = interaction.guild.channels.cache.get("1339329876662030346") || interaction.channel;

                const winnerEmbed = new EmbedBuilder()
                    .setDescription(`# Gerenciador de vitórias\n-# Vitória adicionada a <@${userId}>!\nAgora com **${winnerProfile.wins + 1}** vitórias`)
                    .setColor(myColours.bright_blue_ocean)
                    .setThumbnail(winningMember.user.displayAvatarURL({ dynamic: true, size: 512, format: 'png' }))
                    .setTimestamp();


                await winLogChannel.send({ embeds: [logEmbed] });

                console.log(`Player ${winningMember?.user?.username}|${winningMember?.user?.id} won the bet: ${betId}.`, `Player ${losingMember?.user?.username}|${losingMember?.user?.id} lost the bet: ${betId}.`);
                interaction.replied || interaction.deferred
                    ? interaction.followUp({ embeds: [winnerEmbed] }).catch(console.error)
                    : interaction.reply({ embeds: [winnerEmbed] }).catch(console.error);
            }
            if (customId == "see_rank") {
                await returnServerRank(interaction);
            }
            if (customId == "see_profile") {
                await returnUserRank(interaction.user, interaction, "send");
            }

            const session = client.embedSessions.get(interaction.user.id);
            if (!session) return interaction.reply({ content: "❌ Você não iniciou um embed.", flags: 64 });
        
            const { embedData, channel } = session;

            if (interaction.customId === "edit_title") {
                const modal = new ModalBuilder()
                    .setCustomId("modal_title")
                    .setTitle("Alterar Título");

                const input = new TextInputBuilder()
                    .setCustomId("title_input")
                    .setLabel("Novo título:")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(input));
                return interaction.showModal(modal);
            }

            if (interaction.customId === "edit_description") {
                const modal = new ModalBuilder()
                    .setCustomId("modal_description")
                    .setTitle("Alterar Descrição");

                const input = new TextInputBuilder()
                    .setCustomId("desc_input")
                    .setLabel("Nova descrição:")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(input));
                return interaction.showModal(modal);
            }

            if (interaction.customId === "edit_color") {
                const modal = new ModalBuilder()
                    .setCustomId("modal_color")
                    .setTitle("Alterar Cor");

                const input = new TextInputBuilder()
                    .setCustomId("color_input")
                    .setLabel("Cor em HEX (ex: #ff0000)")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(new ActionRowBuilder().addComponents(input));
                return interaction.showModal(modal);
            }

            if (interaction.customId === "send_embed") {
                console.log(embedData);
                
                const embed = new EmbedBuilder()
                    .setTitle(embedData.title)
                    .setDescription(embedData.description)
                    .setColor(embedData.color);

                await channel.send({ embeds: [embed] });
                client.embedSessions.delete(interaction.user.id);
                return interaction.reply({ content: "✅ Embed enviado!", flags: 64 });
            }
            if (interaction.customId === "modal_title") {
                embedData.title = interaction.fields.getTextInputValue("title_input");

                const embed = {
                    title: embedData.title,
                    description: embedData.description,
                    color: embedData.color
                };
            
                await interaction.update({
                    content: "🛠️ Embed atualizado!",
                    embeds: [embed]
                });
            }
        
            if (interaction.customId === "modal_description") {
                embedData.description = interaction.fields.getTextInputValue("desc_input");
                const embed = {
                    title: embedData.title,
                    description: embedData.description,
                    color: embedData.color
                };
            
                await interaction.update({
                    content: "🛠️ Embed atualizado!",
                    embeds: [embed]
                });
            }
        
            if (interaction.customId === "modal_color") {
                const color = interaction.fields.getTextInputValue("color_input").replace("#", "");
                if (!/^([0-9A-F]{6})$/i.test(color)) {
                    return interaction.reply({ content: "❌ Cor inválida! Use formato HEX.", flags: 64 });
                }
                embedData.color = parseInt(color, 16);
                const embed = {
                    title: embedData.title,
                    description: embedData.description,
                    color: embedData.color
                };
            
                await interaction.update({
                    content: "🛠️ Embed atualizado!",
                    embeds: [embed]
                });
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
    async getBetById(betId) {
        const bet = await Bet.findById(betId);
        if (!bet) return this.sendReply(interaction, "# Esta aposta não existe!");
        return bet;
    }
    async returnErrorToMember(interaction, errorTypes) {
        // Collect all error messages for each errorType
        const messages = errorTypes.map(type => this.errorMessages[type] || "Erro desconhecido. Tente novamente.");

        // Join all error messages with a line break
        const message = messages.join('\n\n');  // Adds a newline between multiple errors
        this.sendReply(interaction, message);
        // Send the error messages as a reply

        return this.messages;
    }
    goBack(bet, client, interaction) {
        return this.sendReply(interaction, "# Voltando, selecione a opcão de iniciar quando a aposta estiver cheia.")
    }
    /**
     * 
     * @param {Bet} bet 
     * @param {Client} client
     * @param {Interaction} interaction 
     * @returns 
     */
    async endBet(bet, client, interaction) {
        const channel = interaction.guild.channels.cache.get(bet.betChannel.id);
        if (!channel) return console.error("Erro: O canal não foi encontrado.");

        bet.status = "off";
        await bet.save();

        const newEmbed = EmbedBuilder.from(interaction.message.embeds[0])
            .setDescription(`## Aposta fechada pr <@${interaction.user.id}>\nObrigado por jogar na **BLOOD APOSTAS 🩸**\n\n-# Volte sempre.`)
            .setColor(Colors.White)
            .setThumbnail(interaction.user.displayAvatarURL({ extension: "png", size: 512 }))
            .setFields();

        await channel.permissionOverwrites.edit(bet.players[0], {
            ViewChannel: false
        });

        await channel.permissionOverwrites.edit(bet.players[1], {
            ViewChannel: false
        });
        await channel.setName(channel.name.replace("💎", "🔒"));

        return await interaction.reply({ embeds: [newEmbed] });
    }

    sendReply(interaction, content) {
        return interaction.replied || interaction.deferred
            ? interaction.followUp({ content, flags: 64 })
            : interaction.reply({ content, flags: 64 });
    }
    removeItemOnce(arr, value) {
        return arr.filter(item => item !== value);
    }


};
