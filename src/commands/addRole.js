const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChatInputCommandInteraction } = require("discord.js");
const myColours = require("../structures/colours");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addrole")
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
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // Apenas quem pode gerenciar cargos pode usar
/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 * @returns 
 */
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply("# Você não tem permissões.");
        const role = interaction.options.getRole("cargo");
        const member = interaction.guild.members.cache.get(interaction.options.getUser("usuario").id);

        if (!role || !member) {
            return interaction.reply({ content: "Cargo ou usuário não encontrado.", flags: 64 });
        }

        if (role.name.toLowerCase().includes("dono")) {
            return interaction.reply({ content: "Você não pode atribuir esse cargo.", flags: 64 });
        }

        // Definição de rótulos para os cargos
        const prematives = {
            administrador: "ADM │",
            staff: "STAFF │",
            mediadores: "MED │",
            team: "SS │",
            analista: "ANALISE │",
        };

        let roleTag = "";
        for (const key in prematives) {
            if (role.name.toLowerCase().includes(key)) {
                roleTag = prematives[key];
                break;
            }
        }

        const displayName = `${roleTag} ${member.user.username.toUpperCase()}`;
        const logChannel = interaction.guild.channels.cache.get("1340360434414522389");

        if (member.roles.cache.has(role.id) && member.nickname !== displayName) {
            const embed = new EmbedBuilder()
                .setTitle("Gerenciador de cargos!")
                .setDescription(`O ${member} já tinha esse cargo, mas não o nome!\n\n-# Por: <@${interaction.user.id}>`)
                .setColor(myColours.bright_blue_ocean)
                .setTimestamp()
                .setFooter({ text: "Por APOSTAS" });

            member.setNickname(displayName, `Nome alterado!`).catch(() => this.sendTemporaryMessage(interaction, "Ocorreu um erro ao tentar mudar o nome."));
            interaction.reply({ embeds: [embed] });
            if (logChannel) logChannel.send({ embeds: [embed] });
            return;
        }

        member.roles.add(role).then(() => {
            const embed = new EmbedBuilder()
                .setTitle("Gerenciador de cargos!")
                .setDescription(`O cargo <@&${role.id}> foi adicionado a ${member}!\n\n-# Por: <@${interaction.user.id}>`)
                .setColor(myColours.bright_blue_ocean)
                .setTimestamp()
                .setThumbnail(member.user.defaultAvatarURL)
                .setFooter({ text: "Por APOSTAS" });

            member.setNickname(displayName, `Cargo ${role.name} adicionado!`).catch(() => this.sendTemporaryMessage(interaction, "Ocorreu um erro ao tentar mudar o nome."));
            interaction.reply({ embeds: [embed] });
            if (logChannel) logChannel.send({ embeds: [embed] });
        }).catch(err => {
            console.error(err);
            interaction.reply({ content: "Ocorreu um erro ao tentar adicionar o cargo.", flags: 64 });
        });
    },

    sendTemporaryMessage(interaction, content) {
        interaction.reply({ content, flags: 64 }).then(mg => {
            setTimeout(() => mg.delete().catch(() => { }), 2000);
        });
    }
    
};
