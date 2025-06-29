import dotenv from 'dotenv';
dotenv.config();

import {
    Client,
    ClientOptions,
    Collection,
    REST,
    Routes,
    EmbedBuilder
} from 'discord.js';
import { readdirSync } from 'fs';
import path from 'path';
import { SlashCommand } from '../types/SlashCommand';
import { PrefixCommand } from '../types/PrefixCommand';
import { Event } from '../types/Event';
import { Cooldown } from '../types/Cooldown';
import { REST as DuqueRest } from '@duque.edits/rest';


export class Bot extends Client {
    public slashCommands: Collection<string, SlashCommand>;
    public prefixCommands: Collection<string, PrefixCommand>; // Define properly if needed
    public api: DuqueRest;
    public embeds: Collection<string, { embed: EmbedBuilder, by: string, status: 'on' | 'off' }[]>;
    public cooldowns: Collection<string, Cooldown>;

    constructor(options: ClientOptions) {
        super(options);

        this.slashCommands = new Collection();
        this.prefixCommands = new Collection();
        this.api = new DuqueRest().setClientKey("877598927149490186");
        this.handleProcessErrors();

        this.cooldowns = new Collection();
        this.embeds = new Collection();
    }

    async loadCommands() {
        const slashDir = path.join(__dirname, "..", "commands", "slash");
        const prefixDir = path.join(__dirname, "..", "commands", "prefix");

        const slashFiles = readdirSync(slashDir).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
        const prefixFiles = readdirSync(prefixDir).filter(f => f.endsWith('.ts') || f.endsWith('.js'));

        for (const file of slashFiles) {
            const commandModule = await import(path.join(slashDir, file));
            const command: SlashCommand = commandModule.default || commandModule;

            if (!command || !command.data || !command.execute) continue;

            this.slashCommands.set(command.data.name, command);
        }

        for (const file of prefixFiles) {
            const commandModule = await import(path.join(prefixDir, file));
            const command: PrefixCommand = commandModule.default;

            if (!command || !command.name || !command.execute) continue;
            this.prefixCommands.set(command.name, command);
        }
        const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN as string);

        (async () => {
            try {
                rest.put(Routes.applicationCommands(process.env.CLIENT_ID as string), {
                    body: this.slashCommands.map(cmd => cmd.data.toJSON()),
                }).then(_ => console.log("Successfully reloaded application (/) commands."));
            } catch (error) {
                console.error(error);
            }
        })();
    }
    async loadEvents() {
        const eventsDir = path.join(__dirname, "..", "events");
        const files = readdirSync(eventsDir).filter(file => file.endsWith(".ts") || file.endsWith(".js"));

        for (const file of files) {
            const eventModule = await import(path.join(eventsDir, file));
            const event: Event = eventModule.default || eventModule;

            if (event.once) this.once(event.name, (...args: []) => event.execute(this, ...args));
            else this.on(event.name, (...args: []) => event.execute(this, ...args));
        }
    }
    handleProcessErrors() {
        process.on("unhandledRejection", (error) => {
            console.error("Unhandled promise rejection:", error);
        });

        process.on("uncaughtException", (error) => {
            console.error("Uncaught exception:", error);
        });
    }
}