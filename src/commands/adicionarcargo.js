const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ChatInputCommandInteraction,
} = require("discord.js");
const myColours = require("../structures/colours");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("adicionarcargo")
        .setDescription("Adiciona um cargo a um usuário.")
        .addRoleOption(option =>
            option.setName("cargo")
                .setDescription("O cargo a ser adicionado.")
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName("usuario")
                .setDescription("O usuário que receberá o cargo.")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const role = interaction.options.getRole("cargo");
        const user = interaction.options.getUser("usuario");
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({ content: "Usuário não encontrado no servidor.", flags: 64 });
        }

        if (role.name.toLowerCase().includes("ceo")) {
            return interaction.reply({ content: "Você não pode atribuir esse cargo.", flags: 64 });
        }

        const prefixos = {
            diretor: "DIR |",
            ss: "SS |",
            dev: "DEV |",
            staff: "STAFF |",
            helper: "HELPER |",
            ticket: "SUP |",
        };

        const lowerRoleName = role.name.toLowerCase();
        const roleTag = Object.entries(prefixos).find(([key]) => lowerRoleName.includes(key))?.[1] || "";
        const currentName = member.displayName;
        const hasTag = currentName.startsWith(roleTag);
        const displayName = hasTag ? currentName : `${roleTag} ${currentName}`;
        

        try {
            await member.roles.add(role);

            if (displayName !== member.displayName) {
                await member.setNickname(displayName, `Cargo ${role.name} adicionado por ${interaction.member.displayName}`);
            }

            const embed = new EmbedBuilder()
                .setTitle("Cargo atribuído com sucesso!")
                .setDescription(`O cargo <@&${role.id}> foi adicionado a ${member}.\n\n-# Por: <@${interaction.user.id}>`)
                .setColor(myColours.bright_blue_ocean)
                .setTimestamp()
                .setThumbnail(member.user.displayAvatarURL())
                .setFooter({ text: `Por ${interaction.client.user.username}` });

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Erro ao adicionar cargo:", error);
            return interaction.reply({ content: "Ocorreu um erro ao tentar adicionar o cargo.", flags: 64 });
        }
    },
};
