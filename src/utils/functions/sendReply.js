module.exports = async (interaction, content) => {
    return interaction.replied || interaction.deferred
        ? interaction.followUp({ content, flags: 64 })
        : interaction.reply({ content, flags: 64 });
}
