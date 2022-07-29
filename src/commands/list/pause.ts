import { CommandInteraction } from "discord.js";

import { SlashCommandBuilder } from '@discordjs/builders';
import { Bot } from "../../bot/bot.js";

export const command =  {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pause the current song.'),
	async execute(interaction: CommandInteraction, bot: Bot) {
		bot.pause();
		await interaction.reply("The bot is paused.");
	},
};
