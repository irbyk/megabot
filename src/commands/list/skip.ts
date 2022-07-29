import { CommandInteraction } from "discord.js";

import { SlashCommandBuilder } from '@discordjs/builders';
import { Bot, BotEvent } from "../../bot/bot.js";

export const command =  {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip the song currently playing.'),
	async execute(interaction: CommandInteraction, bot: Bot) {
		bot.skip();
		bot.once(BotEvent.Skipped, async (song: {title:string}) => {
			try {
				await interaction.reply(`${song.title} has been skipped.`);
			} catch (err) {
				console.error(err);
			}
		});
	},
};
