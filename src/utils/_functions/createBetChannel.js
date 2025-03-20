const Bet = require("../../structures/database/bet");
const myColours = require("../../structures/colours");
const { PermissionFlagsBits, EmbedBuilder, ChannelType, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = async (interaction, bet) => {
    const { guild } = interaction;
    const totalBets = await Bet.countDocuments();
    const formattedTotalBets = String(totalBets).padStart(3, '0');

    const betChannel = await guild.channels.create({
        name: `💎・aposta・${formattedTotalBets}`,
        type: ChannelType.GuildText,
        topic: bet._id.toString(),
        //parent: "1339324693110329458",
        permissionOverwrites: [
            {
                id: guild.roles.everyone.id,
                deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
            },
            {
                id: bet.players[0],
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
            },
            {
                id: bet.players[1],
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
            },

        ]
    });
    // Notify users
    const embed = new EmbedBuilder()
        .setColor(myColours.gun_metal)
        .setDescription(`# Aposta ${bet.betType}\n> Aposta criada com sucesso, vá para o [canal](https://discord.com/channels/${guild.id}/${betChannel.id}) e consulte as informações.`)
        .setTimestamp();

    interaction.replied || interaction.deferred
        ? interaction.followUp({ embeds: [embed], flags: 64 })
        : interaction.reply({ embeds: [embed], flags: 64 });

    bet.betChannel = { id: betChannel.id, name: betChannel.name };
    await bet.save();

    interaction.message.delete();

    // Embed for the bet channel
    const embedForChannel = new EmbedBuilder()
        .setColor(Colors.White)
        .setDescription(`# Aposta ${bet.betType}: valor ${bet.amount}€\n> Converse com um dos nossos mediadores para avançar com a aposta.`)
        .addFields([
            { name: "Equipa 1", value: `<@${bet.players[0]}>`, inline: true },
            { name: "Equipa 2", value: `<@${bet.players[1]}>`, inline: true }
        ])
        .setTimestamp();

    // Buttons
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`set_winner-${bet._id}`).setLabel("Definir ganhador").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`end_bet-${bet._id}`).setLabel("Encerrar aposta").setStyle(ButtonStyle.Danger)
    );

    await betChannel.send({
        content: `<@&1336838133030977666>, <@${bet.players[0]}>, <@${bet.players[1]}>`,
        embeds: [embedForChannel],
        components: [row]
    });

    return betChannel;
}