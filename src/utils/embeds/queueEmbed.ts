import { Match } from "@duque.edits/rest";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, GuildMember } from "discord.js";
import returnTeams from "../returnTeams";

type Player = {
    id: string;
    name: string;
}

export function queueEmbed(match: Match) {
    const embed = new EmbedBuilder()
        .setTitle(`Fila ${match.type} ╶╴ Criada`)
        .setColor(Colors.LightGrey)
        .setDescription(`Bem-vindo, aqui podes jogar contra outros membros, as equipas serão aleatórias quando a aposta iniciar.`)
        .setFields(returnTeams(match.players as Player[], match.maximumSize));
    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
        new ButtonBuilder()
            .setCustomId(`enter_match-${match._id}`)
            .setLabel("Entrar na fila")
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`leave_match-${match._id}`)
            .setLabel("Sair da fila")
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId(`shut_match-${match._id}`)
            .setLabel("Encerrar fila")
            .setStyle(ButtonStyle.Secondary),

    )
    return { embed, row };
}