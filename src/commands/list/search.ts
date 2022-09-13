import { ChatInputCommandInteraction, SelectMenuBuilder } from "discord.js";

import { SlashCommandBuilder } from '@discordjs/builders';
import { Bot } from "../../bot/bot.js";
import { Song } from "../../bot/song.js";

export const command =  {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('Search a song from plex.')
		.addStringOption(option => option
			.setName('name')
			.setDescription('Enter the song\'s name')
			.setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction, bot: Bot) {
		if( !interaction.isChatInputCommand()) return;
		const songName = interaction.options.getString('name');
		if (songName === null) {
			await interaction.reply('Please provide a song name.');
			return
		}
		const songs: Song[] = await bot.searchSongs(songName);
		
		console.log("Songs found : ");
		console.dir(songs);

		if(songs.length > 0) {
			const selectMenu = new SelectMenuBuilder()
				.setCustomId('select_search_song');
				//.setPlaceholder('Nothing selected');
			for (const song of songs) {
				selectMenu.addOptions({
					label: song.title,
					description: song.album +", " + song.artist,
					value: song.key,
				})
			}
			

			const response = await bot.setSelectMenu(selectMenu);

			await interaction.reply(response);
		} else {
			await interaction.reply("No song found :cry:.");
		}
		// try { 
		// 	bot.loadSong(song);

		// 	if(!bot.isPlaying()) await bot.play();
		// 	const message = await bot.getSongInteraction();//await getMessage(song);
		// 	await interaction.reply(message);
		// } catch (error) {
		// 	console.error(error);
		// 	await interaction.reply(`There is an issue and the bot cannot play the song :cry:`);
		// }
		
	},
};