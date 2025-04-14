const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  BaseInteraction,
  ChatInputCommandInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction
} = require("discord.js");
const { returnServerRank, returnUserRank } = require("../utils/utils");
const outmatch_handler = require("../utils/handlers/outmatch_handler");
const shutMatch_handler = require("../utils/handlers/shutMatch_handler");
const match_menu_handler = require("../utils/handlers/match_menu_handler");
const match_confirm_handler = require("../utils/handlers/match_confirm_handler");
const setup_handler = require("../utils/handlers/setup_handler");
const User = require("../structures/database/User");
const BotClient = require("..");
const challengeMatch_handler = require("../utils/handlers/challengeMatch_handler");
const {
  entermatch_handler,
  handleMatchSelectMenu,
  endMatch_handler,
  setWinner_handler,
} = require("../utils/utils").handlers;
const kickoutSelectMenu_handler = require("../utils/handlers/kickoutSelectMenuHandler");
const { StringSelectMenuOptionBuilder } = require("discord.js");
const resolveProtectionType = require("../utils/functions/resolveProtectionType");

module.exports = class InteractionEvent {
  constructor(client) {
    this.name = "interactionCreate";
  }
  /**
   *
   * @param {StringSelectMenuInteraction} interaction
   * @param {BotClient} client
   * @returns
   */
  async execute(interaction, client) {
    if (interaction.user.bot) return;

    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        return await command.execute(interaction, client);
      }
      let [action, matchType, matchId] = interaction.customId.split("-");
      let { customId } = interaction;
      console.log({ customId: `InteractionCreate - customId: ` + customId });

      // 📌 Mapeamento de ações para simplificar if/else
      const handlers = {
        enter_match: () => entermatch_handler(interaction, client),
        out_match: () => outmatch_handler(interaction, matchId, client),
        see_rank: () => returnServerRank(interaction, client),
        see_profile: () => returnUserRank(interaction.user, interaction, "send", client),
        select_menu: () => handleMatchSelectMenu(interaction, client),
        shut_match: () => shutMatch_handler(interaction, matchId, client),
        match_selectmenu: () => match_menu_handler(interaction, client),
        match_confirm: () => match_confirm_handler(interaction, client),
        update_user_rank: async () => {
          await interaction.deferUpdate();

          if (interaction.user.id !== matchType && (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator))) {
            return interaction.reply({
              embeds: [
                new EmbedBuilder(
                  {
                    title: "Você não pode clicar neste botão",
                    description: `Esta interação não foi iniciada por você!`,
                    color: 0xff0000,
                    timestamp: new Date().getTime(),
                  }
                )],
              flags: 64
            });
          }
          const embed = (await returnUserRank(interaction.guild.members.cache.get(matchType).user, interaction))?.embed;

          if (!embed) {
            return interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setTitle("Esse usuario não foi registrado!")
                  .setTimestamp()
                  .setDescription(
                    "Nenhum usuário deste servidor com esse nome!"
                  )
                  .setFooter({
                    text: "Chame um ADM para o ajudar!",
                  })
                  .setColor(0xff0000),
              ],
            });
          }
          await interaction.message.edit({ embeds: [embed] });
        },
        update_rank: async () => {
          await interaction.deferUpdate();
          const { embed, row } = await returnServerRank(interaction);
          const page = 0;
          console.log({ embed });

          await interaction.message.edit({
            embeds: [await embed(page)], // Await to resolve the async function
            withResponse: true,
            components: row ? [row(page)] : [],
          });
        },
        setup_select_menu: () => setup_handler(interaction),
        activate_protections: async () => {
          if ((matchType !== interaction.user.id) && (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator))) {
            return interaction.reply({
              embeds: [new EmbedBuilder(
                {
                  title: "Você não pode clicar neste botão",
                  description: `Esta interação não foi iniciada por você!`,
                  color: 0xff0000,
                  timestamp: new Date().getTime(),
                }
              )],
              flags: 64
            })
          }

          const foundUser = await User.findOrCreate(matchType);
          const protections = foundUser.protections;
          const message = protections.length !== 0 ? `Você tem ${protections?.length} proteções, qual você quer ativar?` : "Você não tem proteções para ativar!";
          console.log({ protections });
          
          const row = protections.length !== 0 ?
            [
              new ActionRowBuilder().addComponents(
              new StringSelectMenuBuilder()
                .setCustomId(`menu_activate_protections-${matchType}`)
                .addOptions(
                  ...protections.map(p => new StringSelectMenuOptionBuilder()
                    .setLabel(`Proteção: ${resolveProtectionType(p.type)}`)
                    .setDescription(`Ativar ${resolveProtectionType(p.type)} por 30 minutos.`)
                    .setValue(`${p.type}`)
                  )))] : [];

          await interaction.reply({ content: message, components: row, flags: 64 });
        },
        menu_activate_protections: async () => {
          const option = interaction.values[0];
          const userProfile = await User.findOrCreate(matchType);
          const protection = userProfile.protections.find(p => p.type == option);

          protection.activatedWhen = new Date();
          const time = this.getRemainingTime(protection)

          await interaction.reply(time);
          await userProfile.save();
        },
        challenge_match: () => challengeMatch_handler(interaction),
        kickout_selectmenu: () => kickoutSelectMenu_handler(interaction),
        next: () => this.updatePage(interaction, 1),
        prev: () => this.updatePage(interaction, -1),
      };

      if (handlers[action]) return await handlers[action]();

      // 📌 Mapeamento para modais
      const modalConfigs = {
        edit_title: {
          id: "modal_title",
          title: "Alterar Título",
          fieldId: "title_input",
          label: "Novo título:",
          style: TextInputStyle.Short,
        },
        edit_description: {
          id: "modal_description",
          title: "Alterar Descrição",
          fieldId: "desc_input",
          label: "Nova descrição:",
          style: TextInputStyle.Paragraph,
        },
        edit_color: {
          id: "modal_color",
          title: "Alterar Cor",
          fieldId: "color_input",
          label: "Cor em HEX (ex: #ff0000)",
          style: TextInputStyle.Short,
        },
        edit_image: {
          id: "modal_image",
          title: "Alterar Imagem",
          fieldId: "image_input",
          label: "Url de uma Imagem",
          style: TextInputStyle.Paragraph,
        },
      };

      if (modalConfigs[customId]) {
        return interaction.showModal(this.createModal(modalConfigs[customId]));
      }

      // 📌 Atualização dos dados do embed
      if (customId === "send_embed") {
        const session = client.embedSessions.get(interaction.user.id);
        if (!session)
          return interaction.reply({
            content: "❌ Você não iniciou um embed.",
            flags: 64,
          });

        const { embedData, channel } = session;
        const embed = new EmbedBuilder()
          .setTitle(embedData.title)
          .setDescription(embedData.description)
          .setColor(embedData.color);
        await channel.send({ embeds: [embed] });
        client.embedSessions.delete(interaction.user.id);
        return interaction.reply({ content: "✅ Embed enviado!", flags: 64 });
      }

      if (customId.startsWith("modal_")) {
        const session = client.embedSessions.get(interaction.user.id);
        if (!session)
          return interaction.reply({
            content: "❌ Você não iniciou um embed.",
            flags: 64,
          });

        const { embedData, channel } = session;
        return this.updateEmbed(interaction, embedData);
      }

      if (action === "smodal") {
        const options = {
          "input-setup-seasonRole": (int) => {
            const roleInput = int.fields.getTextInputValue(
              "input-setup-seasonRole"
            );
            const role = int.guild.roles.cache.find(
              (r) => r.name === roleInput
            );

            console.log({ roleInput, role });

            if (!role) {
              return int.reply({
                embeds: [
                  new EmbedBuilder()
                    .setTitle("Cargo não encontrado")
                    .setDescription("Tente novamente com o nome estritamente")
                    .setColor(0xff0000)
                    .setTimestamp(),
                ],
                flags: 64, // optional
              });
            }

            console.log("Found role:", role.name);
          },
        };
        interaction.fields.fields.forEach((field, fieldId) => {
          const handler = options[fieldId];
          if (typeof handler === "function") {
            handler(interaction);
          }
        });
      }
    } catch (error) {
      console.error("Erro inesperado no evento interactionCreate:", error);
      const response = {
        content:
          "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
        flags: 64,
      };
      return interaction.replied || interaction.deferred
        ? interaction.followUp(response)
        : interaction.reply(response);
    }
  }

  createModal({ id, title, fieldId, label, style }) {
    return new ModalBuilder()
      .setCustomId(id)
      .setTitle(title)
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId(fieldId)
            .setLabel(label)
            .setStyle(style)
            .setRequired(true)
        )
      );
  }

  async updateEmbed(interaction, embedData) {
    const fieldIdMap = {
      modal_title: "title_input",
      modal_description: "desc_input",
      modal_color: "color_input",
      image_url: "image_input",
    };

    const fieldId = fieldIdMap[interaction.customId];
    if (!fieldId) return;

    let value = interaction.fields.getTextInputValue(fieldId);

    if (interaction.customId === "modal_color") {
      value = value.replace("#", "");
      if (!/^([0-9A-F]{6})$/i.test(value)) {
        return interaction.reply({
          content: "❌ Cor inválida! Use formato HEX.",
          flags: 64,
        });
      }
      embedData.color = parseInt(value, 16);
    } else {
      embedData[
        interaction.customId === "modal_title" ? "title" : "description"
      ] = value;
    }

    const embed = new EmbedBuilder()
      .setTitle(embedData.title)
      .setDescription(embedData.description)
      .setColor(embedData.color);

    await interaction.update({
      content: "🛠️ Embed atualizado!",
      embeds: [embed],
    });
  }
  getRemainingTime(protection) {
    if (protection.activatedWhen) {
      
    }
    const [hours, minutes] = protection.longevity.split(":").map(Number);

    const expiration = new Date();
    expiration.setHours(expiration.getHours() + hours);
    expiration.setMinutes(expiration.getMinutes() + minutes);

    const now = new Date();
    const diffMs = expiration - now;
    if (diffMs <= 0) return "Expirado";

    const unixTimestamp = Math.floor(expiration.getTime() / 1000);
    console.log({ hours, minutes, activatedWhen: protection.activatedWhen });
    
    return `Valida ate: <t:${unixTimestamp}:f>`; // Ex: "em 45 minutos"
  }
  updatePage = async (interaction, pageChange = 1) => {
    const { customId } = interaction;
    const [_, rawPage] = customId.split("-").map(Number);
    const page = rawPage + pageChange;

    const { embed, row } = await returnServerRank(interaction);

    await interaction.message.edit({
      embeds: [await embed(page)],
      components: [row(page)],
    });

    await interaction.deferUpdate();
  };
};
