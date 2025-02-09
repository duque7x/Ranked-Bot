const { EmbedBuilder, Message, PermissionFlagsBits, Colors, ActionRowBuilder } = require("discord.js");
const BotClient = require("..");
const User = require("../structures/database/User");
const Bet = require("../structures/database/bet");
const { addWins } = require("./utils");

module.exports = {
    name: "manage", // Command name

    /**
     * Executes the command.
     * @param {Message} message 
     * @param {string[]} args 
     * @param {BotClient} client 
     */
    execute(message, args, client) {
        const situation = args[0]?.toLowerCase();

        if (!situation) {
            return this.sendTemporaryMessage(message, "❌ Por favor, especifique uma situação válida!");
        }

        switch (situation) {
            case "bet":
                this.betHandler(message, args.slice(1), client);
                break;

            default:
                this.sendTemporaryMessage(message, "❌ Situação não reconhecida!");
                break;
        }
    },

    /**
     * Sends a temporary message that deletes itself after a delay.
     * @param {Message} msg 
     * @param {string} content 
     */
    sendTemporaryMessage(msg, content) {
        msg.reply(content).then(mg => {
            setTimeout(() => {
                mg.delete().catch(() => { });
            }, 2000);
        });
    },

    /**
     * Handles "bet" related actions.
     * @param {Message} message 
     * @param {string[]} args 
     * @param {BotClient} client 
     */
    betHandler(message, args, client) {
        const action = args[0]?.toLowerCase();

        const possibleActions = {
            addwin: this.addWin.bind(this),
            removewin: this.removeWin.bind(this),
        };

        if (!possibleActions[action]) {
            return this.sendTemporaryMessage(message, `❌ Ação de aposta inválida! Ações disponíveis: ${Object.keys(possibleActions).join(", ")}`);
        }

        // Execute the corresponding action
        possibleActions[action](message, args.slice(1), client);
    },

    /**
     * Handles the addition of a win for a bet.
     * @param {Message} message 
     * @param {string[]} args 
     * @param {BotClient} client 
     */
    addWin(message, args, client) {
        const userId = args[0] ?? message.author.id;
        const amount = args[1] ?? 1;

        if (!userId) {
            return this.sendTemporaryMessage(message, "❌ Por favor, forneça o ID da aposta para adicionar uma vitória!");
        }
       
        addWins(userId, amount, message);
    },

    /**
     * Handles the removal of a win for a bet.
     * @param {Message} message 
     * @param {string[]} args 
     * @param {BotClient} client 
     */
    removeWin(message, args, client) {
        const betId = args[0];

        if (!betId) {
            return this.sendTemporaryMessage(message, "❌ Por favor, forneça o ID da aposta para remover uma vitória!");
        }

        // Placeholder logic for removing a win
        this.sendTemporaryMessage(message, `✅ Vitória removida da aposta com ID: ${betId}`);
    },
};
