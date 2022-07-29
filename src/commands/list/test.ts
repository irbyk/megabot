import { CommandInteraction } from "discord.js";

import { SlashCommandBuilder } from '@discordjs/builders';
import { Bot } from "../../bot/bot.js";

export const command =  {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('PLay a local song to test the audio.'),
	async execute(interaction: CommandInteraction, bot: Bot) {
		await bot.testPlay();
		await interaction.reply("Start the test.");
	},
};