import { Message } from "discord.js";
import { Bot } from "../structures/Client";
import { Guild } from "@duque.edits/rest";

export interface PrefixCommand {
    name: string;
    description: string,
    alias: string[]
    execute(client: Bot, message: Message, args: string[], guild?: Guild): Promise<any> | any;
}
