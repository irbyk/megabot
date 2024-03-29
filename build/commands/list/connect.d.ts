import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from '@discordjs/builders';
import { Bot } from "../../bot/bot.js";
export declare const command: {
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    execute(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void>;
};
export declare function connectToVoiceChannel(interaction: ChatInputCommandInteraction, bot: Bot): void;
//# sourceMappingURL=connect.d.ts.map