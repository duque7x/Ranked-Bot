import { Bot } from "../structures/Client";

export interface Event {
    name: string;
    once: boolean;
    execute(client: Bot, ...args: []): any | void;
}