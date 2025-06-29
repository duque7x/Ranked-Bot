import { EmbedBuilder, Colors, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

export default function generateDashboard() {
    const embed = new EmbedBuilder()
        .setColor(Colors.LightGrey)
        .setTitle(`Configurar bot`)
        .setDescription(
            [
                `Abaixo, você encontrará um menu para ajustar as configurações do bot.`,
                `-# <:seta:1373287605852176424> Se tiveres uma dúvida chame a equipa de suporte.`
            ].join("\n")
        )
        .setTimestamp();

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .setComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`setup`)
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Sistemas')
                        .setValue('syst')
                        .setEmoji("<:shield:1386365524921028630>")
                        .setDescription(`Ativar/Desativar um sistema usado pelo bot`),
                    new StringSelectMenuOptionBuilder()
                        .setLabel(`Loja`)
                        .setDescription(`Configure a loja do bot`)
                        .setValue(`shop`)
                        .setEmoji("<:shop:1388519997592047757>"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('\u200b')
                        .setValue('separator1'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel(`Prefixo`)
                        .setDescription(`Definir o prefixo para ser usado pelo bot`)
                        .setValue(`prefix`)
                        .setEmoji("<:code:1386365486832554105>"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel(`Modos`)
                        .setDescription(`Definir os modos a ser usado pelo bot`)
                        .setValue(`prices`)
                        .setEmoji("<:money:1386365532952858685>"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('\u200b')
                        .setValue('separator2'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Canais')
                        .setValue('gl_channels')
                        .setDescription('Defina os canais importantes')
                        .setEmoji('<:channel:1386363440385364108>'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Categorias')
                        .setValue('gl_categories')
                        .setDescription('Defina as categorias importantes')
                        .setEmoji('<:folders:1386363124923240508>'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('\u200b')
                        .setValue('separator3'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Cargos')
                        .setValue('roles')
                        .setDescription('Defina os cargos importantes')
                        .setEmoji('<:stem:1386363782191906856>'),
                    /*    new StringSelectMenuOptionBuilder()
                           .setLabel('Emojis')
                           .setValue('emojis')
                           .setDescription('Defina os emojis importantes')
                           .setEmoji('<:emojis:1386363773090271252>'), */
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Mensagens')
                        .setValue('messages')
                        .setDescription('Defina as mensagens importantes')
                        .setEmoji('<:message:1386364070764216390>'),
                ));
    return { embed, row };
}

