const { EmbedBuilder } = require("@discordjs/builders");
const Match = require("../../structures/database/match");
const sendReply = require("../_functions/sendReply");
const { StringSelectMenuInteraction, TextInputBuilder, Colors, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require("discord.js");
const { ModalBuilder } = require("@discordjs/builders");
const { ActionRowBuilder } = require("@discordjs/builders");

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

    if (!match) return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setTitle("Partida offline")
                .setDescription("Esta partida não se encontra na base de dados")
                .setColor(0xff00000)
                .setTimestamp()
        ]
    });
    const playersOption = match.players.map((pl, index) => new StringSelectMenuOptionBuilder()
        .setLabel(`${pl.name}`)
        .setValue(`creator-${pl.id}-${matchId}`)
        .setDescription(`Definir que o jogador *${pl.name} foi o criador da sala`));

    if (option == "creator") {
        return interaction.reply({
            embeds: [new EmbedBuilder()
                .setTitle("Definir o criador da sala")
                .setDescription("Somente os capitões poderam definir o criador")
                .setColor(Colors.Grey)
                .setTimestamp()
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(`setcreator-${match._id}`)
                        .addOptions(playersOption)
                )]
        })

    }
}