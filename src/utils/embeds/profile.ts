/* import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, GuildMember } from 'discord.js';
import { request } from 'undici';
import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';

import { BetUser } from '@duque.edits/rest'; // Ajusta o path se necessário

type defaultBasesPath = {
    "1": string;
    "2": string;
    "3": string;
    "4": string;
    "5": string;
    "6": string;
    "7": string;
    "8": string;
    "9": string;
    "10": string;
};

export async function profileCard(data: BetUser | undefined, member: GuildMember , defaultBasesPath: defaultBasesPath ) {
    try {
         registerFont(path.join(__dirname, "..", "..", "profiles", 'fonts', 'ARIAL.TTF'), {
            family: 'Arial',
        });

        const basePath = defaultBasesPath[(data.profileCard?.banner?.equipped?.toString() ?? "1") as keyof defaultBasesPath];
        const baseImage = await loadImage(basePath);

        const canvas = createCanvas(baseImage.width, baseImage.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(baseImage, 0, 0);

        // Avatar
        const avatarURL = member.displayAvatarURL({ extension: 'png', size: 256 });
        const avatarRes = await request(avatarURL);
        const avatarArrayBuffer = await avatarRes.body.arrayBuffer();
        const avatar = await loadImage(Buffer.from(avatarArrayBuffer));

        const circleX = 900;
        const circleY = 240;
        const radius = 150;

        ctx.save();
        ctx.beginPath();
        ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, circleX - radius, circleY - radius, radius * 2, radius * 2);
        ctx.restore();

        // const x = 455
        // const y = 360
        ////  const width = 54
        const height = 380


        //   const midX = x + width / 2;
        //const midY = y + height / 2;


        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.font = '20px Arial';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // ctx.fillText(member.user.tag, midX, midY);

        ctx.fillText(member.user.tag, 810, 480);

        ctx.font = '20px Arial';
        ctx.textAlign = "start";
        ctx.textBaseline = "middle";

        ctx.fillText(data?.profileCard?.description || "Use o botão abaixo para alterar a sua bio.", 60, 310);

        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'start';
        ctx.textBaseline = "middle";

        const labels = [
            { label: 'Coins', value: data?.coins, x: 195, y: 410 },
            { label: 'Crédito', value: `${data?.credit}€`, x: 394, y: 410 },
            { label: 'Vitórias', value: data?.wins, x: 195, y: 504 },
            { label: 'Derrotas', value: data?.losses, x: 394, y: 504 },
            { label: 'Vezes jogadas', value: data?.betsPlayed?.length, x: 195, y: 599 }
        ];

        labels.forEach(({ value, x, y }) => {
            ctx.fillText(value?.toString() ?? "0", x, y);
        });

        const buffer = canvas.toBuffer('image/png');
        const attachment = new AttachmentBuilder(buffer, { name: `rank-${member.id}.png` });
        const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
                .setLabel("Alterar Bio")
                .setCustomId(`chn_bio-${member.id}`)
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setLabel("Banner")
                .setCustomId(`chn_banner-${member.id}`)
                .setStyle(ButtonStyle.Secondary)
        );

        return { card: attachment, row }; 



    } catch (error) {
        console.error(error);
    }
}
 */


import { EmbedBuilder, GuildMember } from "discord.js"
import rest from "@duque.edits/rest";

export function profileEmbed(data: rest.User | undefined, member: GuildMember) {
    const embed = new EmbedBuilder()
        .setAuthor({ name: `Perfil | ${member.user.username}`, iconURL: member.user.displayAvatarURL() })
        .setColor(member.displayHexColor)
        .setDescription([
            `Pontos: **${data?.points ?? 0}** ╶╴ Vitórias: **${data?.wins ?? 0}**`,
            `MVPs: **${data?.mvps ?? 0}** ╶╴ Derrotas: **${data?.losses ?? 0}**`,
            `Vezes jogadas: **${data.gamesPlayed.length ?? 0}** ╶╴ Blacklist **${data?.blacklist === true ? "Sim" : "Não"}**`,
        ].join("\n"))
        .setThumbnail(member.user.displayAvatarURL({ size: 512 }))
        .setFooter({ iconURL: member.guild.iconURL(), text: member.guild.name.toUpperCase() });

    return { embed, name: "Embed De Perfil" };
}