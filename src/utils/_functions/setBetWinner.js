const { PermissionFlagsBits, EmbedBuilder, Colors } = require("discord.js");

module.exports = async (bet, member) => {
    const userId = member.id;
    const { amount } = bet;
    const isAdmin = member?.permissions?.has(PermissionFlagsBits.Administrator) || false;

    // Atualiza ou cria usuário no banco
    const userProfile = await require("./addCredit")(userId, parseInt(amount), isAdmin, 1);

    const embed = new EmbedBuilder()
        .setDescription(`# Gerenciador de crédito\nCrédito de **${amount}€** foi adicionado a <@${userId}>!\n-# Agora com **${userProfile.wins}**`)
        .setColor(Colors.White)
        .setFooter({ text: "Você pode guardar este crédito ou receber do mediador..." })
        .setTimestamp();
    // Atualiza aposta
    bet.winner = userId;
    bet.status = "won";
    await bet.save();
    await require("./addWin")(member);

    return { embed, userProfile };
}