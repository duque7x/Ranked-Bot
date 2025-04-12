const { StringSelectMenuInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 */
module.exports = async function setup_handler(interaction) {
    const value = interaction.values[0];
    const options = {
        logs: () => {
            const modal = new ModalBuilder()
                .setTitle("Configurar canais logs")
                .setCustomId(`smodal-logs-${interaction.user.id}`);

            const generalLogs = new TextInputBuilder()
                .setCustomId('general-channel')
                .setLabel("Nome do canal de logs geral")
                .setPlaceholder("Use o nome completo do canal, exemplo:・logs")
                .setRequired(true)
                .setStyle(TextInputStyle.Short);
            const ticketCategory = new TextInputBuilder()
                .setCustomId('ticket-category')
                .setLabel("Nome da cetegoria para tickets")
                .setPlaceholder("Use o nome completo da cetegoria, exemplo: logs-ticket")
                .setRequired(true)
                .setStyle(TextInputStyle.Short);
            const matchesChannel = new TextInputBuilder()
                .setCustomId('matches-channel')
                .setLabel("Nome do canal de logs para as filas")
                .setPlaceholder("Use o nome completo do canal, exemplo: logs-filas")
                .setRequired(true)
                .setStyle(TextInputStyle.Short);

            const row = new ActionRowBuilder().addComponents(generalLogs);
            const row2 = new ActionRowBuilder().addComponents(ticketCategory);
            const row3 = new ActionRowBuilder().addComponents(matchesChannel);

            modal.addComponents(row, row2, row3);

            interaction.showModal(modal);
        },
        matches: () => { },
        ranking: () => { },
        auto_config: () => { },
    }
    if (options[value]) return options[value]();

};

