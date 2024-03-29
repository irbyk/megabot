import { CommandInteraction } from "discord.js";

import { SlashCommandBuilder } from '@discordjs/builders';

export const command =  {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction: CommandInteraction) {
		await interaction.reply('Pong!');
	},
};
