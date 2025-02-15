const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ChatInputCommandmessage,
    Colors,
    Message,
} = require("discord.js");
const myColous = require("../structures/colours");

const BotClient = require("..");

module.exports = {
    name: "ticket",

    /**
     * 
     * @param {Message} message
     * @param {BotClient} client
     */
    async execute(message, args, client) {
        const embed = new EmbedBuilder()
            .setTitle("ATENDIMENTO")
            .setDescription("Bem-vindo(a) à seção de atendimento, escolha a opção que melhor atende à sua necessidade.")
            .setColor(myColous.gun_metal)
            .setTimestamp()

        const select = new StringSelectMenuBuilder()
            .setCustomId("select")
            .setPlaceholder("Escolhe uma opção")
            .addOptions(
                new StringSelectMenuOptionBuilder().setLabel("REEMBOLSO").setDescription("abra um ticket para pedir reembolso").setValue("ticket_reembolso").setEmoji("<:money:1340351659670241350:>"),
                new StringSelectMenuOptionBuilder().setLabel("SUPORTE").setDescription("abra um ticket de suporte para qualquer problema").setValue("ticket_suporte").setEmoji("🆘"),
                new StringSelectMenuOptionBuilder().setLabel("MEDIADOR").setDescription("abra um ticket para pedir reembolso").setValue("ticket_mediador").setEmoji("👥"),
                new StringSelectMenuOptionBuilder().setLabel("SER ADM").setDescription("abra um ticket para ser adm").setValue("ticket_adm").setEmoji("<:escudo:1340351657766293527:>"),
                new StringSelectMenuOptionBuilder().setLabel("SER INFLUENCIADOR").setDescription("abra um ticket para ser influenciador").setValue("ticket_influenciador")
            );

        const row = new ActionRowBuilder().addComponents(select);

        // Obter o canal alvo
        const targetChannel = args[0] || message.channel;

        if (!targetChannel || targetChannel.type !== 0) {
            return message.reply({ content: "Canal inválido ou não é um canal de texto.", ephemeral: true });
        }

        try {
            await targetChannel.send({
                embeds: [embed],
                components: [row],
            });

            this.sendTemporaryMessage(message, `Ticket criado em ${targetChannel}`);

        } catch (error) {
            console.error("Erro:", error);
            await message.reply({ content: "Ocorreu um erro ao configurar o canal de tickets.", ephemeral: true });
        }
    },
    sendTemporaryMessage(msg, content) {
        msg.reply(content).then(mg => {
            setTimeout(() => {
                mg.delete();
            }, 2000);
        });
    }
};
