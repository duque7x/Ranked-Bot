const Match = require("../../structures/database/match");
const { StringSelectMenuInteraction } = require("discord.js");
const enterChallengeMatch = require("../functions/enterChallengeMatch");
const outChallengeMatch = require("../functions/outChallengeMatch");
const shutChallengeMatch = require("../functions/shutChallengeMatch");
const kickOutChallengeMatch = require("../functions/kickOutChallengeMatch");
const createChallengeMatchChannel = require("../functions/createChallengeMatchChannel");
const { matchOff } = require("../../structures/embeds/Embeds");

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
module.exports = async function challengeMatch_handler(interaction) {
    const { customId } = interaction;
    const [_, _id] = customId.split("-");
    const [_1, userAction] = interaction.values[0].split("-");
    const match = await Match.findById(_id);

    if (!match) {
        return interaction.reply({
            embeds: [matchOff],
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
