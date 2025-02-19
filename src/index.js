const { Client, IntentsBitField, Collection, REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

class BotClient extends Client {
    constructor(options) {
        super(options);

        this.commands = new Collection();
        this.commandArray = []; // Store commands for registration
        this.loadEvents();
        this.loadCommands();
        this.handleProcessErrors();
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
            if (command.data && command.execute) {
                this.commands.set(command.data.name, command);
                this.commandArray.push(command.data.toJSON()); // Convert to JSON for registration
            } else {
                console.warn(`Command ${file} is missing "data" or "execute" property.`);
            }
        }
    }

    async registerSlashCommands() {
        console.log("Registering commands: ");

        const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

        (async () => {
            try {
                console.log('Started refreshing application (/) commands.');

                await rest.put(
                    Routes.applicationGuildCommands(process.env.CLIENT_ID, "1336809872884371587"),
                    { body: this.commandArray },
                );

                console.log('Successfully reloaded application (/) commands.');
            } catch (error) {
                console.error(error);
            }
        })();
        console.log("Registered.");
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
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.GuildModeration,
        IntentsBitField.Flags.GuildWebhooks,
    ],
});

client.login(process.env.DISCORD_TOKEN);
client.registerSlashCommands();
module.exports = BotClient;
