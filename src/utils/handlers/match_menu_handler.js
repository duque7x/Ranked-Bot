const Match = require("../../structures/database/match");
const sendReply = require("../functions/sendReply");
const { SlashCommandBuilder, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits, StringSelectMenuInteraction } = require("discord.js");

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 */
module.exports = async function creator_handler(interaction) {
    const { user, customId } = interaction;
    const [action, option, matchId] = customId.split("-");
    const [option2, supposedCreatorId, matchId2] = interaction.values[0].split("-");
    const match = await Match.findOne({ _id: matchId });

    if (!match) return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setTitle("Partida offline")
                .setDescription("Esta partida não se encontra na base de dados")
                .setColor(0xff0000)
                .setTimestamp()
        ]
    });
    const keys = {
        creator: () => "o criador da sala",
        mvp: () => "o mvp da sala",
        winner: () => `que o time ${supposedCreatorId.split("team")[1] == "A" ? 1 : 2} foi vencedor`,
    }
    
    if (keys[option]) {
        const forName = keys[option]();
        await interaction.message.edit({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Confirmar ${forName}`)
                    .setDescription(`Capitões devem confirmar ${option == "mvp" || option == "creator" ? `que <@${supposedCreatorId}> foi ${forName}` : forName} `)
                    .setTimestamp()
                    .setColor(Colors.Grey)
            ],
            components: [
                new ActionRowBuilder()
                    .addComponents(new ButtonBuilder()
                        .setLabel("Confirmar [0/2]")
                        .setCustomId(`match_confirm-${option}-${supposedCreatorId}-${matchId}`)
                        .setStyle(ButtonStyle.Success))
            ]
        });
        return await interaction.deferUpdate();
    }
}