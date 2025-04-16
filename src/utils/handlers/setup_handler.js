const { StringSelectMenuInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType, Colors } = require("discord.js");
const Config = require("../../structures/database/configs");

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 */
module.exports = async function setup_handler(interaction) {
    const value = interaction.values[0];
    const options = {
        matches: async () => {
            const modal = new ModalBuilder()
                .setTitle("Configurar canais partida")
                .setCustomId(`smodal-partida-${interaction.user.id}`);

            const normalMatch = new TextInputBuilder()
                .setCustomId('normal-channel')
                .setLabel("Nome do canal de partida normal")
                .setPlaceholder("Use o nome completo do canal, exemplo:・fila-partida")
                .setRequired(true)
                .setStyle(TextInputStyle.Short);
            const challengeMatch = new TextInputBuilder()
                .setCustomId('challenge-channel')
                .setLabel("Nome do canal de partida desafio")
                .setPlaceholder("Use o nome completo do canal, exemplo:・fila-desafio")
                .setStyle(TextInputStyle.Short);
            const taticMatch = new TextInputBuilder()
                .setCustomId('tatic-channel')
                .setLabel("Nome do canal de partida tatico")
                .setPlaceholder("Use o nome completo do canal, exemplo:・fila-tatico")
                .setStyle(TextInputStyle.Short);

            const row = new ActionRowBuilder().addComponents(normalMatch);
            const row2 = new ActionRowBuilder().addComponents(challengeMatch);
            const row3 = new ActionRowBuilder().addComponents(taticMatch);

            modal.addComponents(row, row2, row3);
            await interaction.showModal(modal);
        },
        ranking: async () => { },
        auto_config: async () => {
            await interaction.reply({
                content: `Criando canais...`,
                flags: 64
            });
            const matchesCategory = await interaction.guild.channels.create({
                name: `Criar Filas`,
                type: ChannelType.GuildCategory
            });
            const rankingCategory = await interaction.guild.channels.create({
                name: `Ranking`,
                type: ChannelType.GuildCategory
            });

            const rankingChannel = await rankingCategory.children.create({
                name: `・ver-ranking`,
                type: ChannelType.GuildText
            });

            const normalMatch = await matchesCategory.children.create({
                name: `・fila-partida`,
                type: ChannelType.GuildText
            });
            const challengeMatch = await matchesCategory.children.create({
                name: `・fila-desafio`,
                type: ChannelType.GuildText
            });
            const taticMatch = await matchesCategory.children.create({
                name: `・fila-tatico`,
                type: ChannelType.GuildText
            });

            const seasonRole = await interaction.guild.roles.create({
                name: `・Season 1`,
                color: Colors.DarkAqua,
                mentionable: true,
            });
            const config = await Config.findOneAndUpdate({ "guild.id": interaction.guildId }, { guild: { id: interaction.guildId } }, { upsert: true, new: true });

            config.setupServerConfig.matchesConfigs.channels.categoryId = matchesCategory.id;
            config.setupServerConfig.matchesConfigs.channels.allowedIds.defaultId = (normalMatch).id;
            config.setupServerConfig.matchesConfigs.channels.allowedIds.otherIds = [(challengeMatch).id, (taticMatch).id];

            config.setupServerConfig.rankingConfigs.channels.categoryId = rankingCategory.id;
            config.setupServerConfig.rankingConfigs.channels.allowedIds.defaultId = (rankingChannel).id;

            config.setupServerConfig.seasonRoleId = seasonRole.id;
            await interaction.editReply({ content: "Servidor e bot configurados com sucesso!", flags: 64 });
            await interaction.member.roles.add(seasonRole);

            await config.save();


            console.log({ config });

        },
    }
    if (options[value]) return options[value]();
};