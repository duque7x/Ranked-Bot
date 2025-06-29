import { Match, MATCHTYPES, STATES } from "@duque.edits/rest";
import { ActionRowBuilder, APIActionRowComponent, APIComponentInActionRow, ButtonBuilder, ButtonInteraction, ChannelType, Colors, ComponentType, EmbedBuilder, Guild, GuildMember, PermissionFlagsBits, VoiceChannel } from "discord.js";
import { queueEmbed } from "../../../embeds/queueEmbed";
import rest, { MATCHSTATUS } from "@duque.edits/rest";
type Player = {
    id: string;
    name: string;
}
export async function enterMatch(interaction: ButtonInteraction, match: Match, guild: rest.Guild) {
    await match.addPlayer(interaction.user.id, interaction.user.username);

    const { embed, row } = queueEmbed(match);
    await interaction.update({ embeds: [embed], components: [row] });
    const matchEmbed = embed;

    const { maximumSize } = match;

    const hasReachedSize = match.players.length === match.maximumSize;
    const teamSize = maximumSize / 2;
    const matchIndex = guild.matches.cache.filter(m => m.status !== MATCHSTATUS.SHUTTED)
        .filter(m => m.status !== MATCHSTATUS.CREATED)
        .toArray().findIndex(m => m._id == match._id);

    if (hasReachedSize) {
        await match.setStatus(MATCHSTATUS.ON);
        const componentData = interaction.message.components.find(c => c.type === ComponentType.ActionRow);
        const rebuiltRow = new ActionRowBuilder<ButtonBuilder>();

        for (const comp of (componentData as APIActionRowComponent<APIComponentInActionRow>).components) {
            if (comp.type === ComponentType.Button) {
                const btn = ButtonBuilder.from(comp).setDisabled(true);
                rebuiltRow.addComponents(btn);
            }
        }
        matchEmbed
            .setTitle(`Fila ${match.type} ╶╴ Iniciada`)
            .addFields({
                name: "Iniciada",
                value: "Esta fila foi iniciada! Aguarde a criação dos canais."
            })
            .setColor(0x00C349);

        await interaction.message.edit({ embeds: [matchEmbed], components: [rebuiltRow] });

        const shuffledPlayers = randomizePlayers(match.players as Player[], match);
        const teamOnePlayers = shuffledPlayers.slice(0, teamSize);
        const teamTwoPlayers = shuffledPlayers.slice(teamSize, maximumSize);

        console.log({ teamOnePlayers, teamTwoPlayers });

        const basePerms: Permissions[] = [{
            id: interaction.guild.roles.everyone.id,
            allow: [PermissionFlagsBits.ViewChannel],
            deny: [PermissionFlagsBits.Connect],
        }];

        const teamOnePerms: Permissions[] = [...basePerms, ...teamOnePlayers.map(p => ({ id: p?.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect] }))];
        const teamTwoPerms: Permissions[] = [...basePerms, ...teamTwoPlayers.map(p => ({ id: p?.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect] }))];
        const globalPerms: Permissions[] = [...new Set([...teamOnePerms, ...teamTwoPerms])];

        const [teamOneChannel, globalChannel, teamTwoChannel, textChannel] = await Promise.all([
            createVoiceChannel(`Equipa 1 ・ ${matchIndex.toString().padStart(3, "0")}`, teamOnePerms, interaction.channel.parentId, interaction.guild, 2),
            createVoiceChannel(`Global ・ ${matchIndex.toString().padStart(3, "0")}`, globalPerms, interaction.channel.parentId, interaction.guild, 2),
            createVoiceChannel(`Equipa 2 ・ ${matchIndex.toString().padStart(3, "0")}`, teamTwoPerms, interaction.channel.parentId, interaction.guild, 2),
            createVoiceChannel(`fila・${matchIndex.toString().padStart(3, "0")}`, globalPerms, interaction.channel.parentId, interaction.guild, 0),
        ]);

        const matchStartedEmbed = new EmbedBuilder()
            .setDescription(`Fila ${match.type} ╶╴ Criada`)
            .setColor(Colors.DarkGreen)
            .setTimestamp();

        await textChannel.send({ embeds: [matchStartedEmbed] });

        const prms = [];
        for (let player of teamOnePlayers) {
            const member = interaction.guild.members.cache.get(player.id);
            prms.push(setVoice(member, teamOneChannel as VoiceChannel))
        };
        for (let player of teamTwoPlayers) {
            const member = interaction.guild.members.cache.get(player.id);
            prms.push(setVoice(member, teamTwoChannel as VoiceChannel))
        }
        await Promise.all(prms);
    }
}
type Permissions = {
    id: string,
    allow?: bigint[],
    deny?: bigint[],
}
async function createVoiceChannel<T>(name: string, permissions: Permissions[], parent: string, guild: Guild, type: 2 | 0) {
    return await guild.channels.create({ name, permissionOverwrites: permissions, parent, type: type == 2 ? ChannelType.GuildVoice : ChannelType.GuildText });
}

function randomizePlayers(players: { id: string, name: string }[], match: Match) {
    if (match.type === MATCHTYPES.OneVOne) return match.players;

    const arr = [...players]; // make a copy

    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
    }

    return arr;
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function setVoice(member: GuildMember, channel: VoiceChannel) {
    if (member?.voice?.channel) member?.voice?.setChannel(channel);
}