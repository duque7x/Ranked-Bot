import { ActivityType, TextChannel, EmbedBuilder, Message } from "discord.js";
import { Bot } from "../structures/Client";
import { Event } from "../types/Event";
import { BASESTATUS, Guild } from "@duque.edits/rest";
import cron from "node-cron";

const event: Event = {
    name: "ready",
    once: true,
    async execute(client: Bot) {
        client.user.setActivity({
            name: "criado por  ",
            type: ActivityType.Playing,
        });
        console.log(`O bot está on! Com o nome ${client.user.username} e com ${client.guilds.cache.size} guildas.`);

        const guild = await client.api.guilds.fetch("1336809872884371587");
        return await sendDaily(client, guild);
    }
};

export default event;

function sendDaily(client: Bot, guild: Guild) {
    cron.schedule("00 20 * * *", async () => {
        if (guild.status.dailyRank === BASESTATUS.OFF) return;

        const dailyRankCn = guild.channels.find(cn => cn.type === "dailyRank")?.ids;

        for (let channelId of dailyRankCn || ["1386446212013752440"]) {
            const channel = await client.channels.fetch(channelId) as TextChannel;
            if (!channel) return console.log("Canal de ranking não encontrado.");

            await channel.bulkDelete(2);

            const sorted = (await guild.betUsers.fetchAll())
                .toArray()
                .filter(user => user.id !== "")
                .filter(user => user.credit !== 0)
                .sort((a, b) => b.credit - a.credit);

            const embed = new EmbedBuilder()
                .setTitle(`Destaque Dos Melhores Apostadores`)
                .setTimestamp()
                .setColor(0xFEE65C)
                .setDescription(
                    [`Veja os melhores jogadores de todos os tempos:`,
                        sorted.length
                            ? sorted.map((user, index) =>
                                `**${index + 1}° Lugar** \`|\` <@${user.id}> \`|\` ${user.credit}€`
                            ).join("\n")
                            : "-# Ninguém participou ainda!"].join("\n")
                );

            const newmsg = await channel.send({ embeds: [embed] });
            await guild.addMessage("dailyRank", newmsg.id);
            console.log("Mensagem de ranking diário enviada automaticamente.");
        }
    });
}