const { EmbedBuilder, Colors, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require("discord.js");

module.exports = async function shutMatch_handler(interaction, match) {
    const userId = interaction.user.id;

    if (match.creatorId !== userId && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Você não pode expulsar nesta partida")
                    .setDescription(`<@${userId}> você não tem permissões para expulsar`)
                    .setTimestamp()
                    .setColor(0xff0000)
            ],
            flags: 64
        });
    }

    const kickOut = match.players.filter(p => p.id !== match.creatorId);

    if (kickOut.length === 0) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Ninguém para expulsar")
                    .setDescription("Não há jogadores na partida para serem expulsos.")
                    .setColor(Colors.Orange)
                    .setTimestamp()
            ],
            flags: 64
        });
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`kickout_selectmenu-${match._id}-${interaction.message.id}`)
        .setPlaceholder("Selecione um jogador para expulsar")
        .addOptions(
            ...kickOut.map(p =>
                new StringSelectMenuOptionBuilder()
                    .setLabel(p.name)
                    .setValue(`kickout_option-${p.id}`)
                    .setDescription(`Expulsar ${p.name} da partida`)
            )
        );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    return await interaction.reply({
        content: `**${interaction.member.displayName}**, selecione quem você quer expulsar:`,
        components: [row],
        flags: 64
    });
};
