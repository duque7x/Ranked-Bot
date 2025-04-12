const Match = require("../../structures/database/match");
const sendReply = require("../functions/sendReply");
const Config = require('../../structures/database/configs');
const { SlashCommandBuilder, EmbedBuilder, Colors, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits, ButtonInteraction, StringSelectMenuInteraction } = require("discord.js");
const { errorMessages, returnUserRank } = require("../utils");
const formatTeam = require("../functions/formatTeam");
const { isValidObjectId } = require("../../structures/database/connection");
const enterChallengeMatch = require("../functions/enterChallengeMatch");
const enterMatch_handler = require("./enterMatch_handler");
const outChallengeMatch = require("../functions/outChallengeMatch");
const shutChallengeMatch = require("../functions/shutChallengeMatch");
const kickOutChallengeMatch = require("../functions/kickOutChallengeMatch");

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
module.exports = async function challengeMatch_handler(interaction) {
    if (!interaction.member.voice.channel && !interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
        return await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Canal de voz")
                    .setDescription("Você tem que estar conectado a um canal de voz para entrar uma fila!")
                    .setColor(0xff0000)
                    .setTimestamp()
            ],
            flags: 64
        });
    }
    const { customId, guild, user } = interaction;

    const [_, _id] = customId.split("-");
    const [_1, userAction] = interaction.values[0].split("-");

    const match = await Match.findById(_id);

    if (!match) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Partida offline")
                    .setDescription("Esta partida não se encontra na base de dados")
                    .setColor(0xff0000)
                    .setTimestamp(),
            ],
            flags: 64,
        });
    }

    console.log({userAction});
    
    const options = {
        enter_match: () => enterChallengeMatch(interaction, match),
        out_match: () => outChallengeMatch(interaction, match),
        shut_match: () => shutChallengeMatch(interaction, match),
        kick_out: () => kickOutChallengeMatch(interaction, match)
    }

    if (options[userAction]) return options[userAction]();

    interaction.reply({ content: `Eae suave?`, flags: 64 });
    return;
}
