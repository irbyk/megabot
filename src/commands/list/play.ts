import { ChatInputCommandInteraction } from "discord.js";

import { SlashCommandBuilder } from '@discordjs/builders';
import { Bot } from "../../bot/bot.js";
import { PlexSong } from "../../utils/plex/plex.js";
import { connectToVoiceChannel } from "./connect.js";

export const command =  {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play a song from plex.')
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
		const song: PlexSong = await bot.searchSong(songName);
		
		console.dir(song);
		try {
			if(!bot.isInVocalChannel()) {
				try {
					connectToVoiceChannel(interaction, bot);
				} catch(error) {
					console.error(error);
					interaction.reply("The bot is not in a voice channel and so do you.\
					 Please connect to a voice channel and retry.");
				}
			}
			bot.loadSong(song);

			if(!bot.isPlaying()) await bot.play();
			const message = await bot.getSongInteraction();//await getMessage(song);
			await interaction.reply(message);
		} catch (error) {
			console.error(error);
			await interaction.reply(`There is an issue and the bot cannot play the song :cry:`);
		}
		
	},
};
