import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, CommandInteraction, Interaction, SelectMenuBuilder } from "discord.js";

import { SlashCommandBuilder } from '@discordjs/builders';
import { Bot } from "../../bot/bot.js";
import { Song } from "../../bot/song.js";

export const command =  {
	data: new SlashCommandBuilder()
		.setName('viewqueue')
		.setDescription('View the queue.'),
	async execute(interaction: CommandInteraction, bot: Bot) {
		const queue: Song[] = bot.getQueue().getSongs();
		const selectMenu = new SelectMenuBuilder()
			.setCustomId('select_queue_song');
			//.setPlaceholder('Nothing selected');
		for (let i = 0; i < queue.length; i++) {
			selectMenu.addOptions({
				label: queue[i].title,
				description: queue[i].album +", " + queue[i].artist,
				value: i.toString(),
			})
		}
		
		const rowSelectMenu = new ActionRowBuilder<SelectMenuBuilder>()
			.addComponents(selectMenu);
		const rowButtonMenu = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('restartQueueButton')
				.setLabel('Restart')
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder()
				.setCustomId('clearQueueButton')
				.setLabel('Clear')
				.setStyle(ButtonStyle.Danger),
		);

		const restartQueueButtonHandler =  async (interaction: Interaction<CacheType>) => {
			if (!interaction.isButton()) return;
			if (interaction.customId === 'restartQueueButton') {
				bot.getQueue().resetIndex();
				bot.getClient().removeListener('interactionCreate', restartQueueButtonHandler);
			}
		}
		bot.getClient().on('interactionCreate', restartQueueButtonHandler);

		const clearQueueButtonHandler =  async (interaction: Interaction<CacheType>) => {
			if (!interaction.isButton()) return;
			if (interaction.customId === 'clearQueueButton') {
				bot.getQueue().reset();
				bot.getClient().removeListener('interactionCreate', clearQueueButtonHandler);
			}
		}
		bot.getClient().on('interactionCreate', clearQueueButtonHandler);

		await interaction.reply({
			content : "Queue :",
			components: [rowSelectMenu, rowButtonMenu]
		});
	},
};
