import { ChatInputCommandInteraction, Client, Collection } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Bot } from '../bot/bot.js';
export declare function loadCommands(): Promise<Collection<string, Command>>;
export declare function deploy(commands: Collection<string, Command>, client: Client): Promise<void>;
export declare function deployOneGuild(commands: Collection<string, Command>, client: Client, guildId: string): Promise<unknown>;
export declare function initializeCommand(commands: Collection<string, Command>, client: Client, bot: Bot): void;
export interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction, bot: Bot) => Promise<void>;
}
//# sourceMappingURL=command.d.ts.map