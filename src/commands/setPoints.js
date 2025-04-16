const { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, Colors, SlashCommandBuilder } = require("discord.js");
const Config = require("../structures/database/configs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setpoints")
        .setDescription("Este comando define os pontos que serão usados nas filas")
        .addNumberOption(option =>
            option.setName("win")
                .setDescription("Quantos pontos uma vitória?")
        )
        .addNumberOption(option =>
            option.setName("loss")
                .setDescription("Quantos pontos uma derrota?")
        )
        .addNumberOption(option =>
            option.setName("mvp")
                .setDescription("Quantos pontos para o MVP?")
        )
        .addNumberOption(option =>
            option.setName("creator")
                .setDescription("Quantos pontos para o criador?")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {BotClient} client 
     * @returns 
     */
    async execute(interaction, client) {
        const config = await Config.findOne({ "guild.id": interaction.guildId });
        if (!config) {
            return interaction.reply({ content: "Configuração não encontrada para este servidor.", ephemeral: true });
        }
        const keys = interaction.options.data;
        const embed = new EmbedBuilder()
            .setTitle("Pontos configurados!")
            .setColor(Colors.Gold)
            .setDescription("Os pontos foram definidos para: ")
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        let pointsUpdated = false;
        for (let key of keys) {
            if (key.value !== null && config.points[key.name] !== key.value) {
                config.points[key.name] = key.value;
                embed.addFields({
                    name: key.name,
                    value: `**${key.value}** pontos`
                });
                pointsUpdated = true;
            }
        }
        if (!pointsUpdated) {
            embed.setTitle("Pontos utiliazados:");
            for (let key in config.points) {
                embed.addFields({
                    name: key,
                    value: `**${config.points[key]}** pontos`
                });
            }
        }
        await interaction.reply({ embeds: [embed] });
        await config.save();
    }
};