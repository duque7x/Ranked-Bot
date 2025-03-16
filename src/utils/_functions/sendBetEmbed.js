const { EmbedBuilder, ButtonBuilder, Colors, ButtonStyle, StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");

module.exports = async (interaction, bet, channelToSend) => {
    const { betType, _id, amount } = bet;
    const enterBetId = `enter_bet-${betType}-${_id}-${amount}`;
    const outBetId = `out_bet-${betType}-${_id}-${amount}`;

    const embed = new EmbedBuilder()
        .setDescription(`## Aposta de ${amount}€ | ${betType}\n> Entre na aposta e aguarde a partida começar!`)
        .addFields([
            { name: "Equipa 1", value: "Slot vazio", inline: true },
            { name: "Equipa 2", value: "Slot vazio", inline: true }
        ])
        .setColor(Colors.White);

    const enterBet = new ButtonBuilder()
        .setCustomId(enterBetId)
        .setLabel("Entrar na aposta")
        .setStyle(ButtonStyle.Success);

    const outBet = new ButtonBuilder()
        .setCustomId(outBetId)
        .setLabel("Sair da aposta")
        .setStyle(ButtonStyle.Danger);

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`select_menu-${betType}-${_id}`)
        .addOptions([
            { label: "Iniciar aposta", value: "start_bet_value" },
            { label: "Voltar", value: "go_back" }
        ]);

    const row1 = new ActionRowBuilder().addComponents(enterBet, outBet);
    const row2 = new ActionRowBuilder().addComponents(selectMenu);

    await channelToSend.send({ embeds: [embed], components: [row2, row1] });
    return;
}