const Match = require("../../structures/database/match");
const sendReply = require("../functions/sendReply");
const { EmbedBuilder, PermissionFlagsBits, StringSelectMenuInteraction } = require("discord.js");
const formatTeam = require("../functions/formatTeam");
const enterChallengeMatch = require("../functions/enterChallengeMatch");
const outChallengeMatch = require("../functions/outChallengeMatch");
const shutChallengeMatch = require("../functions/shutChallengeMatch");
const kickOutChallengeMatch = require("../functions/kickOutChallengeMatch");
const createChallengeMatchChannel = require("../functions/createChallengeMatchChannel");

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
module.exports = async function challengeMatch_handler(interaction) {
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
    
    const options = {
        enter_match: () => enterChallengeMatch(interaction, match),
        out_match: () => outChallengeMatch(interaction, match),
        shut_match: () => shutChallengeMatch(interaction, match),
        kick_out: () => kickOutChallengeMatch(interaction, match),
        start: () => createChallengeMatchChannel(interaction, match)
    }

    if (options[userAction]) return options[userAction]();

    interaction.reply({ content: `Eae suave?`, flags: 64 });
    return;
}
