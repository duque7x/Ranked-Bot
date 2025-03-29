const Match = require("../../structures/database/match");
const addPoints = require("../functions/addPoints");
const sendReply = require("../functions/sendReply");
const { SlashCommandBuilder, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits, StringSelectMenuInteraction, ButtonInteraction } = require("discord.js");
const addMvp = require("../functions/addMvp");
const setMatchWinner = require("../functions/setMatchWinner");
const setMatchLosers = require("../functions/setMatchLosers");
const endMatch_handler = require("./endMatch_handler");
const endMatchFunction = require("../functions/endMatchFunction");

/**
 * 
 * @param {ButtonInteraction} interaction 
 */
module.exports = async function match_confirm_handler(interaction) {
    const { user, customId } = interaction;
    const [action, option, supposedUserId, matchId] = customId.split("-");
    const supposedUser = interaction.guild.members.cache.get(supposedUserId);
    const match = await Match.findOne({ _id: matchId });
    const userId = user.id;

    if (!match) return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setTitle("Partida offline")
                .setDescription("Esta partida não se encontra na base de dados")
                .setColor(0xff0000)
                .setTimestamp()
        ],
        flags: 64
    });
    const leadersId = match.leaders.map(p => p.id);
    if (!leadersId.some(id => id === userId)) return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setTitle("Você não pode confirmar nesta partida.")
                .setDescription(`<@${userId}> não és um dos capitões`)
                .setTimestamp()
                .setColor(0xff0000)
        ],
        flags: 64
    });

    const keys = {
        /**
         * 
         * @param {ButtonInteraction} int 
         */
        creator: async (int) => {
            const msg_btn = ButtonBuilder.from(int.message.components[0].components[0].data);
            let [confirmedCount, countLimit] = msg_btn.data.label.split(" ")[1].replace(/\D/g, '').split("").map(p => parseInt(p));
            const userAlreadyConfirmed = match.confirmed.filter(c => c.typeConfirm === "creator").some(p => p.id == userId);
            const matchAlreadyConfirmed = match.confirmed.filter(c => c.typeConfirm === "creator").length == countLimit;
            
            if (matchAlreadyConfirmed) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Esta opção já foi confirmada pelos capitões")
                            .setColor(0xff0000)
                            .setTimestamp()
                    ],
                    flags: 64
                });
                return;
            }
            if (userAlreadyConfirmed) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Você já confirmou!")
                            .setColor(0xff0000)
                            .setTimestamp()
                    ],
                    flags: 64
                });
                return;
            }

            if (confirmedCount < countLimit) {
                ++confirmedCount;
                msg_btn.setLabel(`Confirmar [${confirmedCount}/${countLimit}]`);

                match.confirmed.push({
                    id: String(userId),
                    name: String(user.username),
                    typeConfirm: String("creator")
                });
                await match.save();

                await updateMessage(interaction, msg_btn, "Criador");
            }
            if (confirmedCount >= countLimit) {
                msg_btn.setLabel(`Confirmar [${confirmedCount}/${countLimit}]`);


                match.roomCreator = { id: supposedUserId, name: supposedUser.user.username };
                await match.save();
                await updateMessage(interaction, msg_btn, "Criador", true);
                await addPoints(supposedUserId, 15);

                return;
            }
        },
        mvp: async (int) => {
            const msg_btn = ButtonBuilder.from(int.message.components[0].components[0].data);
            let [confirmedCount, countLimit] = msg_btn.data.label.split(" ")[1].replace(/\D/g, '').split("").map(p => parseInt(p));
            const userAlreadyConfirmed = match.confirmed.filter(c => c.typeConfirm === "mvp").some(p => p.id == userId);
            const matchAlreadyConfirmed = match.confirmed.filter(c => c.typeConfirm === "mvp").length == countLimit;
            
            if (matchAlreadyConfirmed) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Esta opção já foi confirmada pelos capitões")
                            .setColor(0xff0000)
                            .setTimestamp()
                    ],
                    flags: 64
                });
                return;
            }
            if (userAlreadyConfirmed) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Você já confirmou!")
                            .setColor(0xff0000)
                            .setTimestamp()
                    ],
                    flags: 64
                });
                return;
            }

            if (confirmedCount < countLimit) {
                ++confirmedCount;
                msg_btn.setLabel(`Confirmar [${confirmedCount}/${countLimit}]`);

                match.confirmed.push({
                    id: String(userId),
                    name: String(user.username),
                    typeConfirm: String("mvp")
                });

                await match.save();

                await updateMessage(interaction, msg_btn, "MVP");
            }
            if (confirmedCount >= countLimit) {
                msg_btn.setLabel(`Confirmar [${confirmedCount}/${countLimit}]`);
                match.mvp = { id: supposedUserId, name: supposedUser.user.username };

                await match.save();
                await updateMessage(interaction, msg_btn, "MVP", true);
                await addPoints(supposedUserId, 35);
                await addMvp(supposedUserId);
                return;
            }
        },
        winner: async (int) => {
            if (match.winnerTeam.length !== 0) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setTitle("Esta partida ja tem vencedores!")
                        .setColor(0xff0000)
                        .setDescription("Tente novamente ou chame um dos nossos ADMs")
                        .setTimestamp()
                    ]
                })
            };
            
            const msg_btn = ButtonBuilder.from(int.message.components[0].components[0].data);
            let [confirmedCount, countLimit] = msg_btn.data.label.split(" ")[1].replace(/\D/g, '').split("").map(p => parseInt(p));
            const userAlreadyConfirmed = match.confirmed.filter(c => c.typeConfirm === "winner").some(p => p.id == userId);
            const matchAlreadyConfirmed = match.confirmed.filter(c => c.typeConfirm === "winner").length == countLimit;

            if (matchAlreadyConfirmed) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Esta opção já foi confirmada pelos capitões")
                            .setColor(0xff0000)
                            .setTimestamp()
                    ],
                    flags: 64
                });
                return;
            }
            if (userAlreadyConfirmed) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Você já confirmou!")
                            .setColor(0xff0000)
                            .setTimestamp()
                    ],
                    flags: 64
                });
                return;
            }

            if (confirmedCount < countLimit) {
                ++confirmedCount;
                msg_btn.setLabel(`Confirmar [${confirmedCount}/${countLimit}]`);

                match.confirmed.push({
                    id: String(userId),
                    name: String(user.username),
                    typeConfirm: String("winner")
                });

                await match.save();

                await updateMessage(interaction, msg_btn, "Vencedor");
            }
            if (confirmedCount >= countLimit) {
                msg_btn.setLabel(`Confirmar [${confirmedCount}/${countLimit}]`);

                const winningTeam = supposedUserId;
                const losingTeam = winningTeam === "teamA" ? "teamB" : "teamA";
                const msg = interaction.message;

                await setMatchWinner(match, match[winningTeam]);
                await setMatchLosers(match, match[losingTeam]);

                const embed = new EmbedBuilder()
                    .setTitle("Ganhador(es) da partida")
                    .setDescription(`Vitória adicionada ao **time ${winningTeam.split("team")[1] == "A" ? 1 : 2}**!`)
                    .setColor(0x00ff00)
                    .setTimestamp();

                await msg.edit({ components: [], embeds: [embed] });
                return;
            }
        },
    };

    if (keys[option]) return await keys[option](interaction);

    if (option == "end_match") {
        const msg_btn = ButtonBuilder.from(interaction.message.components[0].components[0].data);
        let [confirmedCount, countLimit] = msg_btn.data.label.split(" ")[1].replace(/\D/g, '').split("").map(p => parseInt(p));
        const userAlreadyConfirmed = match.confirmed.filter(c => c.typeConfirm === "end").some(p => p.id == userId);
        const matchAlreadyConfirmed = match.confirmed.filter(c => c.typeConfirm === "end").length == countLimit;

        if (matchAlreadyConfirmed) {
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Esta opção já foi confirmada pelos capitões")
                        .setColor(0xff0000)
                        .setTimestamp()
                ],
                flags: 64
            });
            return;
        }
        if (userAlreadyConfirmed) {
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Você já confirmou!")
                        .setColor(0xff0000)
                        .setTimestamp()
                ],
                flags: 64
            });
            return;
        }

        if (confirmedCount < countLimit) {
            ++confirmedCount;
            msg_btn.setLabel(`Confirmar [${confirmedCount}/${countLimit}]`);

            match.confirmed.push({
                id: String(userId),
                name: String(user.username),
                typeConfirm: String("end")
            });

            await match.save();

            await updateMessage(interaction, msg_btn, "Encerrar");
        }
        if (confirmedCount >= countLimit) {
            return endMatchFunction(match, interaction);
        }
    }
}
/**
 * 
 * @param {ButtonInteraction} interaction 
 */
async function updateMessage(interaction, data, forName, reachedLimit) {
    interaction.deferUpdate();

    const msg = interaction.message;
    const updatedButton = data;
    if (reachedLimit) {
        msg.edit({
            components: [],
            embeds: [
                new EmbedBuilder()
                    .setTitle(`${forName} definido`)
                    .setDescription(`O ${forName.toLowerCase()} desta partida foi definido!`)
                    .setFooter({ text: "Se isso foi um engano chame um dos ADMs" })
                    .setTimestamp()
                    .setColor(0x00ff00)
            ]
        });
        return;
    }
    msg.edit({
        components: [new ActionRowBuilder().setComponents(updatedButton)]
    });
    
    return;
}