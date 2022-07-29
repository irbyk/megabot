import { CommandInteraction } from "discord.js";

import { SlashCommandBuilder } from '@discordjs/builders';
import { Bot } from "../../bot/bot.js";

export const command =  {
	data: new SlashCommandBuilder()
		.setName('resume')
		.setDescription('Resume the current paused song.'),
	async execute(interaction: CommandInteraction, bot: Bot) {
		bot.unpause();
		await interaction.reply("The bot is playing.");
	},
};
