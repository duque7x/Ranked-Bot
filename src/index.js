const { Client, IntentsBitField, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { Low, JSONFile } = require('lowdb');
require("dotenv").config();

class BotClient extends Client {
    constructor(options) {
        super(options);

        // Custom properties
        this.commands = new Collection();
        this.loadEvents();
        this.loadCommands();
        this.handleProcessErrors()
    }

    loadEvents() {
        const eventFiles = fs
            .readdirSync(path.join(__dirname, "events"))
            .filter((file) => file.endsWith(".js"));

        for (const file of eventFiles) {
            const eventPath = path.join(__dirname, "events", file);
            const EventClass = require(eventPath);
            const event = new EventClass(this);

            if (event.once) {
                this.once(event.name, (...args) => event.execute(...args, this));
            } else {
                this.on(event.name, (...args) => event.execute(...args, this));
            }
        }
    }

    loadCommands() {
        const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(path.join(__dirname, 'commands', file));
            this.commands.set(command.name, command);
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

// Create an instance of BotClient
const client = new BotClient({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.GuildModeration,
        IntentsBitField.Flags.GuildWebhooks,
        IntentsBitField.Flags.MessageContent,
    ],
});

// Handle slash command interactions

// Log in to Discord
//client.login("MTMyMzA2ODIzNDMyMDE4MzQwNw.GMajhH.JC8ijxr2a_PpHCYIMuEvywjGOpFViKJ04XcmsM");
client.login(process.env.DISCORD_TOKEN);
module.exports = BotClient;
