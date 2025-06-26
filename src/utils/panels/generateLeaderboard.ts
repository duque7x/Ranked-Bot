import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, Guild } from "discord.js"
import rest, { BetUser, User } from "@duque.edits/rest";
import { splitArray } from "../splitArray";

export function generateLeaderboard(data: rest.Collection<string, User>, guild: Guild) {
    let generateEmbed = (field: "wins" | "losses" | "mvps", page?: number) => {
        if (page <= -1) page = 0;

        const arrayChunks = splitArray(data.toArray().sort((a, b) => b[field] - a[field]), 10);
        const sorted = arrayChunks[page].map(p => guild.members.cache.has(p.id) ? p : data.at(0));

        const translatedField: Record<string, string> = {
            "mvps": "MVPs",
            "wins": "Vitórias",
            "losses": "Derrotas",
        }
        const keys = {
            "mvps": "MVPs",
            "wins": "vitória(s)",
            "losses": "derrota(s)",
        }

        const firstRankedInPage = guild.members.cache.get(sorted[0]?.id ?? sorted[1]?.id);
        const rankings = sorted?.filter(u => u.id !== undefined)
            .map((user, index) =>
                `**${(index + page * 10) + 1}.** <@${user.id}>: ${user[field]}${field == "mvps" ? keys[field] : ` ${keys[field]}`}`
            ).join(`\n`);

        return new EmbedBuilder()
            .setTitle(`Top ${translatedField[field]} — ${guild.name}`)
            .setColor(Colors.LightGrey)
            .setThumbnail(firstRankedInPage?.user?.displayAvatarURL() ?? guild.iconURL())
            .setDescription(rankings || "Sem jogadores nesta pagina!")
            .setFooter({ text: `Pag. ${page + 1}/${Math.ceil(arrayChunks.length)}` });
    }
    let generateRows = (page: number, field: "wins" | "losses" | "mvps") => {
        const arrayChunks = splitArray(data.toArray(), 10);
        const sorted = arrayChunks[page];

        const creditBtn = new ButtonBuilder().setEmoji("<:money:1386365532952858685>").setCustomId(`ld-cts-mvps-${page}`).setStyle(ButtonStyle.Secondary).setDisabled(field === "mvps");
        const winsBtn = new ButtonBuilder().setEmoji("<:energy:1386830320174895265>").setCustomId(`ld-cts-wins-${page}`).setStyle(ButtonStyle.Secondary).setDisabled(field === "wins");
        const lossesBtn = new ButtonBuilder().setEmoji("<:dead:1386845065879748730>").setCustomId(`ld-cts-losses-${page}`).setStyle(ButtonStyle.Secondary).setDisabled(field === "losses");

        const forwardBtn = new ButtonBuilder().setEmoji(process.env.RIGHT_EMOJI).setCustomId(`ld-forward-${field}-${page}`).setStyle(ButtonStyle.Secondary).setDisabled(arrayChunks.length <= page);
        const refreshBtn = new ButtonBuilder().setEmoji(process.env.REFRESH_EMOJI).setCustomId(`ld-refresh-${field}-${page}`).setStyle(ButtonStyle.Secondary);
        const backwardsBtn = new ButtonBuilder().setEmoji(process.env.LEFT_EMOJI).setCustomId(`ld-backward-${field}-${page}`).setStyle(ButtonStyle.Secondary).setDisabled(page === 0);

        const row = new ActionRowBuilder<ButtonBuilder>().setComponents(creditBtn, winsBtn, lossesBtn);
        const row2 = new ActionRowBuilder<ButtonBuilder>().setComponents(backwardsBtn, refreshBtn, forwardBtn);
        return { row, row2 }
    }

    return { generateEmbed, name: "Embed De Ranking", generateRows };
}
