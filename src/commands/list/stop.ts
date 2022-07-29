import { CommandInteraction } from "discord.js";

import { SlashCommandBuilder } from '@discordjs/builders';
import { Bot } from "../../bot/bot.js";

export const command =  {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stop the bot from playing.'),
	async execute(interaction: CommandInteraction, bot: Bot) {
		bot.stop();
		await interaction.reply("The bot is stoped, and the queue is cleared.");
	},
};
