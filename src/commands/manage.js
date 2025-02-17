const { EmbedBuilder, Message, PermissionFlagsBits, Colors, ActionRowBuilder } = require("discord.js");
const BotClient = require("..");
const User = require("../structures/database/User");
const Bet = require("../structures/database/bet");
const { addWins } = require("./utils");
const Config = require("../structures/database/configs");
const myColours = require("../structures/colours");

module.exports = {
    name: "manage", // Command name
    usage: "`!manage bet||config`",
    description: "Este comando altera configurações da aposta! No momento ele está desativado!",

    /**
     * Executes the command.
     * @param {Message} message 
     * @param {string[]} args 
     * @param {BotClient} client 
     */
    execute(message, args, client) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const situation = args[0]?.toLowerCase();

        if (!situation) {
            return this.sendTemporaryMessage(message, "❌ Por favor, especifique uma situação válida!");
        }

        switch (situation) {
            case "bet":
                this.betHandler(message, args.slice(1), client);
                break;
            case "config":
                this.configHandler(message, args.slice(1), client);
                break;
            case "blacklist":
                this.blacklistHandler(message, args.slice(1), client);
                break;
            default:
                this.sendTemporaryMessage(message, "❌ Situação não reconhecida!");
                break;
        }
    },
    logChannel(message) {
        return message.guild.channels.cache.get("1340360434414522389");
    },
    async blacklistHandler(message, args, client) {
        const { guildId, guild } = message;
        let serverConfig = await Config.findOne({ "guild.id": guildId });
        const logChannel = this.logChannel(message);

        if (!serverConfig) {
            serverConfig = new Config({
                guild: { id: guildId, name: guild.name },
                state: { bets: { status: "on" }, rank: { status: "on" } },
                blacklist: []
            });

            await serverConfig.save();
        }

        const action = {
            add: (message, args) => {
                const formatUser = args.match(/^<@!?(\d+)>$/)[1];

                if (serverConfig.blacklist.includes(formatUser)) {
                    const embed = new EmbedBuilder()
                        .setTitle("Gerenciador da blacklist")
                        .setColor(myColours.rich_black)
                        .setDescription(`Jogador ${args} ja se encontra na blacklist!`)
                        .setTimestamp();

                    return message.reply({ embeds: [embed] });
                }

                serverConfig.blacklist.push(formatUser);
                serverConfig.save();

                const embed = new EmbedBuilder()
                    .setTitle("Gerenciador da blacklist")
                    .setColor(myColours.rich_black)
                    .setDescription(`Jogador ${args} foi adicionado a blacklist!`)
                    .setFooter({ text: "Nota: Para sair da blacklist você precisa de pagar 1,50€" })
                    .setTimestamp();

                logChannel.send({ embeds: [embed] });
                return message.reply({ embeds: [embed] });
            },
            remove: (message, args) => {
                const formatUser = args.match(/^<@!?(\d+)>$/)[1];
                const newBlacklist = serverConfig.blacklist.filter(id => id !== formatUser);  // Correct filtering

                if (!serverConfig.blacklist.includes(formatUser)) {
                    const embed = new EmbedBuilder()
                        .setTitle("Gerenciador da blacklist")
                        .setColor(myColours.rich_black)
                        .setDescription(`Jogador ${args} não está na blacklist!`)
                        .setTimestamp();
                    return message.reply({ embeds: [embed] });
                }

                serverConfig.blacklist = newBlacklist;
                serverConfig.save();

                const embed = new EmbedBuilder()
                    .setTitle("Gerenciador da blacklist")
                    .setColor(myColours.rich_black)
                    .setDescription(`Jogador ${args} foi removido da blacklist!`)
                    .setTimestamp();
                logChannel.send({ embeds: [embed] });
                message.reply({ embeds: [embed] });
            }
        }

        if (Object.keys(action).includes(args[0])) return action[args[0]](message, args.slice(1)[0])
        else return message.reply("Use o comando na seguinte forma: `!manage blacklist add||remove <@877598927149490186>`");
    },
    async configHandler(message, args, client) {
        const action = args[0]?.toLowerCase();

        const possibleActions = {
            /**
             * 
             * @param {Message} message 
             * @returns 
             */
            changestatus: async (message) => {
                let { guildId, guild } = message;
                let serverConfig = await Config.findOne({ "guild.id": message.guildId });
                if (!serverConfig) {
                    serverConfig = new Config({
                        guild: { id: guildId, name: guild.name },
                        state: { bets: { status: "on" }, rank: { status: "on" } }
                    });

                    await serverConfig.save();
                }

                const subjects = ["bets", "rank"];

                if (!subjects.includes(args[1])) return this.sendTemporaryMessage(message, "# Argumentos errados! Use o comando na seguinte forma: `!manage config changeStatus bet||rank`");


                const status = serverConfig.state[args[1]].status;

                const newStatus = serverConfig.state[args[1]].status = status == "on" ? "off" : "on";

                serverConfig.state[args[1]].status = newStatus;
                serverConfig.save();

                const embed = new EmbedBuilder()
                    .setColor(0xff4d50)
                    .setTitle("Mudança de estado das: " + args[1].toUpperCase())
                    .setDescription(`**${args[1]}** foi(ram) de **${status}** para **${newStatus}**.`)
                    .setTimestamp();

                message.reply({ embeds: [embed] })
            }

        }

        if (possibleActions[action]) return possibleActions[action](message);
    },
    async statusChanger(message, args, client) {
        const betId = args[0];
        const statusToChange = args[1];

        if (!betId || !statusToChange) return this.sendTemporaryMessage(message, "# Use o comando da seguinte forma: `!manage bet status BET_ID STATUS`");

        const bet = await Bet.findOne({ "_id": betId });


        if (!bet) return this.sendTemporaryMessage(message, "# Esta aposta não existe!");

        bet.status = statusToChange;
        bet.save();

        message.reply("# Estado da aposta mudada!");
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
            status: this.statusChanger.bind(this)
        };

        if (!possibleActions[action]) {
            return this.sendTemporaryMessage(message, `❌ Ação de aposta inválida! Ações disponíveis: ${Object.keys(possibleActions).join(", ")}`);
        }
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return this.sendTemporaryMessage(message, "# Você não tem as permissões necessárias!");

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
