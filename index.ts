import { GatewayIntentBits, Partials, TextChannel, EmbedBuilder } from "discord.js";
import { Bot } from "./src/structures/Client";
import { BASESTATUS, Guild } from "@duque.edits/rest";

const client: Bot = new Bot({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildExpressions,
        GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [Partials.Message, Partials.Channel]
});

client.api.init();
client.loadCommands();
client.login(process.env.DISCORD_TOKEN as string);
client.loadEvents();