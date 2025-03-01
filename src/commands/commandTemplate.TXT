const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, SlashCommandBuilder } = require("discord.js");
const BotClient = require("..");
const Bet = require("../structures/database/bet");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("close")
        .setDescription("Este comando fecha uma aposta, você pode encontrar o id da aposta na descrição!")
        .addStringOption(option => 
            option.setName("opcao")
                .setDescription("Option meu mano.")
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName("id")
                .setDescription("ID da aposta")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const opcao = interaction.options.getString("opcao");
        const id = interaction.options.getString("id");

        if (opcao === "opcao") {
            const bet = await Bet.findOne({ "_id": id }); // Correct MongoDB query
            const channel = await client.channels.fetch(bet.betChannel.id);
            if (!bet) return this.sendTemporaryMessage(interaction, "Nenhuma aposta encontrada com esse ID.");
            if (bet.status == "off") return this.sendTemporaryMessage(interaction, "Esta aposta já está fechada!");

            bet.status = "off";
            await bet.save();
            if (!channel) return console.error("Erro: O canal não foi encontrado.");

            await channel.edit({
                name: "🔒・" + channel.name, 
                permissionOverwrites: [
                    {
                        id: interaction.guild.id, // @everyone
                        deny: [PermissionFlagsBits.ViewChannel] // Hide from everyone
                    },
                    ...bet.players.filter(Boolean).map(playerId => ({
                        id: playerId,
                        deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                    }))
                ],
                parent: "1337588697280942131" // Example parent ID
            });

            return interaction.reply("opcao fechada com sucesso!");
        }
    },

    sendTemporaryMessage(interaction, content) {
        interaction.reply(content).then(mg => {
            setTimeout(() => {
                mg.delete();
            }, 3000);
        });
    }
};
