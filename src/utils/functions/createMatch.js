const Match = require("../../structures/database/match");
const sendReply = require("./sendReply");

module.exports = async (interaction, channel, matchType, sendOrNot, user) => {
    try {
        const userId = user.id;

        // Find matches where the user is a player
        let activeMatchs = await Match.find({ "players": { $elemMatch: { id: userId } } });
        // Filter ongoing matches (not "off" or "shutted")
        let ongoingMatchs = await activeMatchs.filter(b => b.status !== "off" && b.status !== "shutted").sort((a, b) => b.createdAt - a.createdAt);

        // Prevent user from joining another match if already in one
        if (ongoingMatchs.length > 0) {
            let msg = ongoingMatchs.map(match => match._id);

            return await sendReply(interaction, `# Você já está em outra partida! <#${ongoingMatchs[0].matchChannel?.id || ""}>\n-# Id da partida(s): ${msg.join(", ")}\n-# Chame um ADM se esta tendo problemas.`);
        }

        // Determine max team size
        const maximumSize = 2 * Number(matchType.split("x")[0]);
           
        // Create the match
        const match = new Match({
            maximumSize,
            matchChannel: { id: channel.id, name: channel.name },
            matchType,
            status: "created",
            players: [{ id: userId, name: user.username, joinedAt: Date.now() }],
            creatorId: userId
        });

        await match.save();

        // Send embed if required
        if (sendOrNot === true) {
            await require("./sendMatchEmbed")(interaction, match);
        }

        return match;
    } catch (err) {
        console.error(`Erro ao criar partida no canal ${channel.name}:`, err);
    }
}
