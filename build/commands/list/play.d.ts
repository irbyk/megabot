import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from '@discordjs/builders';
import { Bot } from "../../bot/bot.js";
export declare const command: {
    data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
    execute(interaction: ChatInputCommandInteraction, bot: Bot): Promise<void>;
};
//# sourceMappingURL=play.d.ts.map