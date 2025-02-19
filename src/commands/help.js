const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const myColours = require("../structures/colours");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Mostra todos os comandos disponíveis e seus detalhes.")
        .addStringOption(option =>
            option
                .setName("comando")
                .setDescription("Nome do comando para ver mais detalhes.")
                .setRequired(false)
        ),

    /**
     * @param {import("discord.js").ChatInputCommandInteraction} interaction
     * @param {import("..")} client
     */
    async execute(interaction, client) {
        const commandName = interaction.options.getString("comando")?.toLowerCase();
        const commands = client.commands;

        if (commandName) {
            // Verifica se o comando existe
            const command = commands.get(commandName);
            if (!command) {
                return interaction.reply({
                    content: "❌ Esse comando não existe!",
                    flags: 64
                });
            }

            const embed = new EmbedBuilder()
                .setColor(myColours.rich_black)
                .setTitle(`Comando: ${command.name}`)
                .setDescription(command.description || "Sem descrição.")
                .addFields([
                    { name: "Uso", value: command.usage || "Não especificado." },
                    { name: "Quem pode usar", value: command.users ? "duque7x" : "Qualquer pessoa." }
                ]);

            return interaction.reply({ embeds: [embed], flags: 64 });
        }

        // Embed com todos os comandos disponíveis
        const embed = new EmbedBuilder()
            .setColor(myColours.eerie_black_green)
            .setTitle("📜 Lista de Comandos")
            .setDescription("Aqui estão todos os comandos **disponíveis**:")
            .setFooter({ text: "Use /help [comando] para mais detalhes." });

        commands.forEach(cmd => {
            embed.addFields({ name: `/${cmd.name}`, value: cmd.description || "Sem descrição." });
        });

        return interaction.reply({ embeds: [embed], flags: 64 });
    }
};
