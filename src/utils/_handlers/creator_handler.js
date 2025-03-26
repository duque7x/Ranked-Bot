const Match = require("../../structures/database/match");
const sendReply = require("../_functions/sendReply");
const { SlashCommandBuilder, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits, StringSelectMenuInteraction } = require("discord.js");

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 */
module.exports = async function creator_handler(interaction) {
    const { user, customId } = interaction;
    const [option, supposedCreatorId, matchId] = interaction.values[0].split("-");
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
    console.log(match);
    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setTitle("Confirmar criador")
                .setDescription(`Capitões devem confirmar para que o usuario <@${supposedCreatorId}> é criador`)
                .setTimestamp()
                .setColor(Colors.Grey)
        ],
        components: [
            new ActionRowBuilder()
                .addComponents(new ButtonBuilder()
                    .setLabel("Confirmar")
                    .setCustomId(`match_confirm-creator-${supposedCreatorId}-${matchId}`)
                    .setStyle(ButtonStyle.Success))
        ]
    })
}