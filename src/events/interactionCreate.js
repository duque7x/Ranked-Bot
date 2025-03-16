const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const { returnServerRank, returnUserRank } = require("../utils/utils");
const outbet_handler = require('../utils/_handlers/outbet_handler');
const { enterbet_handler, handleBetSelectMenu, endBet_handler, setWinner_handler, btnWinner_handler } = require('../utils/utils').handlers;

module.exports = class InteractionEvent {
    constructor(client) {
        this.name = 'interactionCreate';
    }

    async execute(interaction, client) {
        if (interaction.user.bot) return;

        try {
            if (interaction.isChatInputCommand()) {
                const command = client.commands.get(interaction.commandName);
                if (!command) return;
                return await command.execute(interaction, client);
            }

            let [action, betType, betId, amount] = interaction.customId.split("-");
            let { customId } = interaction;

            // 📌 Mapeamento de ações para simplificar if/else
            const handlers = {
                enter_bet: () => enterbet_handler(interaction),
                out_bet: () => outbet_handler(interaction, betId),
                see_rank: () => returnServerRank(interaction),
                see_profile: () => returnUserRank(interaction.user, interaction, "send"),
                select_menu: () => handleBetSelectMenu(interaction, betId, client),
                end_bet: () => endBet_handler(interaction),
                set_winner: () => setWinner_handler(interaction),
                btn_set_winner: () => btnWinner_handler(interaction)
            };

            if (handlers[action]) return await handlers[action]();

            // 📌 Verifica se a interação está relacionada a edição de embeds
            const session = client.embedSessions.get(interaction.user.id);
            if (!session) return interaction.reply({ content: "❌ Você não iniciou um embed.", flags: 64 });

            const { embedData, channel } = session;

            // 📌 Mapeamento para modais
            const modalConfigs = {
                edit_title: { id: "modal_title", title: "Alterar Título", fieldId: "title_input", label: "Novo título:", style: TextInputStyle.Short },
                edit_description: { id: "modal_description", title: "Alterar Descrição", fieldId: "desc_input", label: "Nova descrição:", style: TextInputStyle.Paragraph },
                edit_color: { id: "modal_color", title: "Alterar Cor", fieldId: "color_input", label: "Cor em HEX (ex: #ff0000)", style: TextInputStyle.Short }
            };

            if (modalConfigs[customId]) {
                return interaction.showModal(this.createModal(modalConfigs[customId]));
            }

            // 📌 Atualização dos dados do embed
            if (customId === "send_embed") {
                const embed = new EmbedBuilder()
                    .setTitle(embedData.title)
                    .setDescription(embedData.description)
                    .setColor(embedData.color);

                await channel.send({ embeds: [embed] });
                client.embedSessions.delete(interaction.user.id);
                return interaction.reply({ content: "✅ Embed enviado!", flags: 64 });
            }

            if (customId.startsWith("modal_")) {
                return this.updateEmbed(interaction, embedData);
            }
        } catch (error) {
            console.error("Erro inesperado no evento interactionCreate:", error);
            const response = { content: "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.", flags: 64 };
            return interaction.replied || interaction.deferred ? interaction.followUp(response) : interaction.reply(response);
        }
    }

    createModal({ id, title, fieldId, label, style }) {
        return new ModalBuilder()
            .setCustomId(id)
            .setTitle(title)
            .addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder().setCustomId(fieldId).setLabel(label).setStyle(style).setRequired(true)
                )
            );
    }

    async updateEmbed(interaction, embedData) {
        const fieldIdMap = {
            modal_title: "title_input",
            modal_description: "desc_input",
            modal_color: "color_input"
        };

        const fieldId = fieldIdMap[interaction.customId];
        if (!fieldId) return;

        let value = interaction.fields.getTextInputValue(fieldId);

        if (interaction.customId === "modal_color") {
            value = value.replace("#", "");
            if (!/^([0-9A-F]{6})$/i.test(value)) {
                return interaction.reply({ content: "❌ Cor inválida! Use formato HEX.", flags: 64 });
            }
            embedData.color = parseInt(value, 16);
        } else {
            embedData[interaction.customId === "modal_title" ? "title" : "description"] = value;
        }

        const embed = new EmbedBuilder()
            .setTitle(embedData.title)
            .setDescription(embedData.description)
            .setColor(embedData.color);

        await interaction.update({ content: "🛠️ Embed atualizado!", embeds: [embed] });
    }
};
