import { ChatInputCommandInteraction, GuildMember } from "discord.js";

import { SlashCommandBuilder } from '@discordjs/builders';
import { Bot } from "../../bot/bot.js";

export const command =  {
	data: new SlashCommandBuilder()
		.setName('connect')
		.setDescription('Connect to the voice channel given, or if none is given the on,e where you are connected.')
		.addStringOption(option => option
			.setName('channel')
			.setDescription('Enter the channel\'s name')
			.setRequired(false)),
	async execute(interaction: ChatInputCommandInteraction, bot: Bot) {
		const channelName = interaction.options.getString('name');
		if (channelName === null) {
			try {
				connectToVoiceChannel(interaction, bot);
			} catch(error) {
				console.error(error);
				await interaction.reply('You are not connected to a voice channel.\
				 Please connect to one, or provide a voice channel name.');
			}
			return
		}
		const voiceChannel = bot.searchVoiceChannel(channelName);
		if (voiceChannel === undefined) {
			await interaction.reply(`There is no voice channel named "${channelName}".`);
			return;
		}
		try {
			bot.connectToVoicChannel(voiceChannel);
			await interaction.reply('Connected !');
		} catch (error) {
			console.error(error);
		}

	},
};

export function connectToVoiceChannel(interaction: ChatInputCommandInteraction, bot: Bot) {
	const voiceChannel =  (interaction.member as GuildMember).voice.channel;
	if( voiceChannel) {
		bot.connectToVoicChannel(voiceChannel);
	} else {
		throw new Error("No connected to a voice channel.")
	}
}