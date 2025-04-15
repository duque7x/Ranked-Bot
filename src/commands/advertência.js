const {
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandBuilder,
    Colors,
    SlashCommandSubcommandBuilder,
} = require("discord.js");
const Config = require("../structures/database/configs");
const User = require("../structures/database/User");
const { bright_blue_ocean } = require("../structures/colours");
const updateRankUsersRank = require("../utils/functions/updateRankUsersRank");

const createSubcommand = (name, desc) =>
    new SlashCommandSubcommandBuilder()
        .setName(name)
        .setDescription(desc)
        .addUserOption(option =>
            option.setName("usuario").setDescription("Usuário a ser manipulado").setRequired(true)
        )
        .addStringOption(option =>
            option.setName("razão").setDescription("Razão da advertência")
        );

module.exports = {
    data: new SlashCommandBuilder()
        .setName("advertência")
        .setDescription("Adiciona ou remove advertências de um usuário.")
        .addSubcommand(createSubcommand("adicionar", "Adiciona uma advertência"))
        .addSubcommand(createSubcommand("remover", "Remove uma advertência"))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const user = interaction.options.getUser("usuario");
        const reason = interaction.options.getString("razão") || "Sem razão específica";

        const [userProfile, config] = await Promise.all([
            User.findOrCreate(user.id),
            Config.findOne({ "guild.id": interaction.guildId })
        ]);

        const { adverts } = userProfile;

        if (sub === "adicionar") {
            adverts.push({
                addedBy: interaction.user.id,
                addedWhen: Date.now(),
                reason
            });

            await userProfile.save();

            const embed = new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription(
                    `# Gerenciador de Advertência\n<@${user.id}> agora tem **${adverts.length}** ${adverts.length === 1 ? "advertência" : "advertências"}`
                )
                .setFooter({ text: "Com 3 ADVs entras na blacklist!" })
                .setTimestamp();

            // Adiciona à blacklist se atingir 3 advertências
            if (adverts.length === 3) {
                if (!config.blacklist.includes(user.id)) config.blacklist.push(user.id);

                userProfile.blacklisted = true;
                await config.save();
                await userProfile.save();
                
                embed.setTitle("Usuário adicionado à blacklist")
                    .setDescription(`<@${user.id}> alcançou 3 advertências e agora está na blacklist!`)
                    .setFooter({ text: "Para sair da blacklist, você precisa pagar 1,50€" });
            }

            await interaction.reply({ embeds: [embed] });
        }

        if (sub === "remover") {
            if (adverts.length === 0) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Red)
                            .setDescription(`<@${user.id}> não possui advertências para remover.`)
                            .setTimestamp()
                    ],
                    ephemeral: true
                });
            }
            // Remove da blacklist se tiver menos de 3 advertências
            if (userProfile.blacklisted && adverts.length < 3) {
                const index = config.blacklist.indexOf(user.id);
                if (index !== -1) config.blacklist.splice(index, 1);
                userProfile.blacklisted = false;
                await config.save();
            }

            adverts.pop();
            await userProfile.save();

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(bright_blue_ocean)
                        .setDescription(
                            `# Gerenciador de Advertência\n<@${user.id}> agora tem **${adverts.length}** ${adverts.length === 1 ? "advertência" : "advertências"}`
                        )
                        .setFooter({ text: "Com 3 ADVs entras na blacklist!" })
                        .setTimestamp()
                ]
            });
        }
        return await updateRankUsersRank(await interaction.guild.members.fetch());
    }
};
