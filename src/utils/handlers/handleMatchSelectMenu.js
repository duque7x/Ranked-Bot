const Match = require("../../structures/database/match");
const { StringSelectMenuInteraction,
    ActionRowBuilder,
    Colors,
    StringSelectMenuOptionBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder,
    ButtonStyle,
    Options,
    PermissionFlagsBits
} = require("discord.js");

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @param {*} client 
 * @returns 
 */
module.exports = async function matchSelectMenu_handler(interaction, client) {
    const { user, customId } = interaction;
    const [option, matchId] = interaction.values[0].split("-");
    const match = await Match.findOne({ _id: matchId });
    const userId = user.id;

    const leadersId = match.leaders.map(p => p.id);
    if (!leadersId.some(id => id === userId) && !interaction.memberPermissions.has(PermissionFlagsBits.Administrator))
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Você não pode alterar esta partida.")
                    .setDescription(`<@${userId}> não és um dos capitões`)
                    .setTimestamp()
                    .setColor(0xff0000)
            ],
            flags: 64
        });
    const matchAlreadyConfirmed = match.confirmed.filter(c => c.typeConfirm === option).length == 2;

    if (matchAlreadyConfirmed) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Esta opção já foi confirmada pelos capitões")
                    .setColor(0xff0000)
                    .setTimestamp()
            ],
            flags: 64
        });
    }
    if (!match) return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setTitle("Partida offline")
                .setDescription("Esta partida não se encontra na base de dados")
                .setColor(0xff0000)
                .setTimestamp()
        ]
    });
    const returnPlayerOpitons = (players, option, key) => {
        return players.map((pl, index) =>
            new StringSelectMenuOptionBuilder()
                .setEmoji(process.env.ON_EMOJI)
                .setLabel(`${interaction.guild.members.cache.get(pl.id).user.username}`)
                .setValue(`${option}-${pl.id}-${matchId}`)
                .setDescription(`Definir que o jogador *${pl.name} ${key}`))
    }
    const playersOptionCreator = returnPlayerOpitons(match.players, `creator`, "foi o criador da sala");
    const playersOptionMvp = returnPlayerOpitons(match.players, `mvp`, "foi o mvp da sala");

    if (option === "creator") {
        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setTitle(`Definir o criador da sala`)
                .setDescription(`Somente os capitões poderão definir o criador da sala`)
                .setColor(Colors.Grey)
                .setTimestamp()
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`match_selectmenu-creator-${matchId}`)
                        .addOptions(playersOptionCreator)
                )]
        });
    }
    if (option === "winner") {
        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setTitle(`Definir o time vencedor`)
                .setDescription(`Somente os capitões poderão definir o time vencedor`)
                .setColor(Colors.Grey)
                .setTimestamp()
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`match_selectmenu-winner-${matchId}`)
                        .addOptions(
                            new StringSelectMenuOptionBuilder()
                                .setLabel(`Equipe 1`)
                                .setValue(`winner-teamA-${matchId}`)
                                .setDescription(`Definir que a equipa 1 ganhou`),
                            new StringSelectMenuOptionBuilder()
                                .setLabel(`Equipe 2`)
                                .setValue(`winner-teamB-${matchId}`)
                                .setDescription(`Definir que a equipa 2 ganhou`)
                        )
                )]
        });
    }
    if (option === "mvp") {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Definir o mvp`)
                    .setDescription(`Somente os capitões poderão definir o MVP`)
                    .setColor(Colors.Grey)
                    .setTimestamp()
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`match_selectmenu-mvp-${matchId}`)
                        .addOptions(playersOptionMvp)
                )]
        });
    }
    if (option == "end_match") {
        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setTitle(`Fechar partida`)
                .setDescription("Somente os capitões poderão podem fechar esta fila.")
                .setColor(0xff0000)
                .setTimestamp()
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel("Confirmar [0/2]")
                        .setCustomId(`match_confirm-end_match-${interaction.user.id}-${matchId}`)
                        .setStyle(ButtonStyle.Success)
                )]
        })
    }
}
