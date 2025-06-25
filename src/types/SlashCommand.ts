import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { Bot } from "../structures/Client";
import { Guild } from "@duque.edits/rest";

export interface SlashCommand {
    data: SlashCommandBuilder;
    adminOnly: boolean;
    constructor(): any;
    execute(client: Bot, interaction: CommandInteraction, guild?: Guild): Promise<any> | any;
}
