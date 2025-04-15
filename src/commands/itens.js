const {
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandBuilder,
    Colors,
} = require("discord.js");
const Config = require("../structures/database/configs");
const updateRankUsersRank = require("../utils/functions/updateRankUsersRank");
const addProtection = require("../utils/functions/addProtection");
const removeProtection = require("../utils/functions/removeProtection");

/**
 * @type {import('discord.js').SlashCommandBuilder}
 */
module.exports = {
    data: new SlashCommandBuilder()
        .setName("itens")
        .setDescription("Este comando adiciona ou remove proteções de um usuário.")
        .addSubcommand((cmd) =>
            cmd
                .setName("adicionar")
                .setDescription("Adiciona proteções")
                .addStringOption((op) =>
                    op
                        .setName("tipo")
                        .setRequired(true)
                        .setDescription("Tipo da proteção a adicionar")
                        .addChoices([
                            {
                                name: "Imunidade",
                                value: "immunity"
                            },
                            {
                                name: "Proteção de pontos",
                                value: "point_protect"
                            },
                            {
                                name: "Dobro de pontos",
                                value: "double_points"
                            }
                        ])
                )
                .addStringOption((op) =>
                    op
                        .setName("longividade")
                        .setRequired(true)
                        .setDescription("Quanto tempo da proteção a remover")
                        .addChoices([
                            {
                                name: "30m",
                                value: "0:30"
                            },
                            {
                                name: "1h",
                                value: "1:00"
                            },
                            {
                                name: "1h 30m",
                                value: "1:30"
                            },
                            {
                                name: "2h",
                                value: "2:00"
                            },
                            {
                                name: "2h 30m",
                                value: "2:30"
                            }
                        ])
                )
                .addUserOption((op) =>
                    op.setName("usuario").setDescription("Usuário a ser manipulado")
                )
        )
        .addSubcommand((cmd) =>
            cmd
                .setName("remover")
                .setDescription("Remove proteções")
                .addStringOption((op) =>
                    op
                        .setName("tipo")
                        .setRequired(true)
                        .setDescription("Tipo da proteção a remover")
                        .addChoices([
                            {
                                name: "Imunidade",
                                value: "immunity"
                            },
                            {
                                name: "Proteção de pontos",
                                value: "point_protect"
                            },
                            {
                                name: "Dobro de pontos",
                                value: "double_points"
                            }
                        ])
                )
                .addStringOption((op) =>
                    op
                        .setName("longividade")
                        .setRequired(true)
                        .setDescription("Quanto tempo da proteção a remover")
                        .addChoices([
                            {
                                name: "30m",
                                value: "0:30"
                            },
                            {
                                name: "1h",
                                value: "1:00"
                            },
                            {
                                name: "1h 30m",
                                value: "1:30"
                            },
                            {
                                name: "2h",
                                value: "2:00"
                            },
                            {
                                name: "2h 30m",
                                value: "2:30"
                            }
                        ])
                )
                .addUserOption((op) =>
                    op.setName("usuario").setDescription("Usuário a ser manipulado")
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const user = interaction.options.getUser("usuario") ?? interaction.user;
        const type = interaction.options.getString("tipo");
        const longevity = interaction.options.getString("longividade");
        const subcommand = interaction.options.getSubcommand();

        let protections;

        if (subcommand === "adicionar") {
            protections = (await addProtection(user.id, type, interaction.user.id, longevity)).protections;

        } else if (subcommand === "remover") {
            protections = (await removeProtection(user.id, type, interaction.user.id, longevity)).protections;

        }
        console.log({ protections });

        const embed = new EmbedBuilder()
            .setColor(subcommand === "adicionar" ? Colors.LightGrey : 0xff0000)
            .setDescription(
                `# Gerenciador de proteções\n <@${user.id}> agora tem **${protections.length}** ${protections.length >= 0 && protections.length !== 1 ? `proteções` : `proteção`
                }\n\n-# Adicionada por <@${interaction.user.id}>`
            )
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });

        return await updateRankUsersRank(await interaction.guild.members.fetch());
    },
};
