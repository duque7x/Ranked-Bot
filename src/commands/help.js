const { EmbedBuilder, Message, Colors } = require("discord.js");
const BotClient = require("..");

module.exports = {
    name: "help",
    description: "Mostra todos os comandos disponíveis e seus detalhes.",
    usage: "`!help [comando]`",

    /**
     * @param {Message} message 
     * @param {string[]} args 
     * @param {BotClient} client 
     */
    async execute(message, args, client) {
        const commandName = args[0]?.toLowerCase();
        const commands = client.commands;

        if (commandName) {
            // Get specific command details
            const command = commands.get(commandName);
            if (!command) return message.reply("❌ Esse comando não existe!");

            const embed = new EmbedBuilder()
                .setColor(require("../structures/colours").rich_black)
                .setTitle(`Comando: ${command.name}`)
                .setDescription(command.description || "Sem descrição.")
                .addFields([
                    { name: "Uso", value: command.usage || "Não especificado." },
                    { name: "Quem pode usar", value: (command.users ? "duque7x" : "Não especificado.") },
                ]);

            return message.reply({ embeds: [embed] });
        }

        // General help embed
        const embed = new EmbedBuilder()
            .setColor(require("../structures/colours").eerie_black_green)
            .setTitle("📜 Lista de Comandos")
            .setDescription("Aqui estão todos os comandos **disponíveis**:")
            .setFooter({ text: "Use !help [comando] para mais detalhes." });

        commands.forEach(cmd => {
            embed.addFields({ name: `!${cmd.name}`, value: cmd.description || "Sem descrição." });
        });

        return message.reply({ embeds: [embed] });
    }
};
