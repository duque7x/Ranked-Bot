module.exports = async (match, winners) => {
    match.winnerTeam = winners;
    await match.save();
    
    for (let user of winners) {
        await require("./addWin")(user.id);
        await require("./addPoints")(user.id, 100);
        await require("./addGamePlayed")(user.id, match._id)
    }

    return { match, winners };
}