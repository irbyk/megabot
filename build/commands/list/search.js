import { SelectMenuBuilder } from "discord.js";
import { SlashCommandBuilder } from '@discordjs/builders';
export const command = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search a song from plex.')
        .addStringOption(option => option
        .setName('name')
        .setDescription('Enter the song\'s name')
        .setRequired(true)),
    async execute(interaction, bot) {
        if (!interaction.isChatInputCommand())
            return;
        const songName = interaction.options.getString('name');
        if (songName === null) {
            await interaction.reply('Please provide a song name.');
            return;
        }
        const songs = await bot.searchSongs(songName);
        console.dir(songs);
        const selectMenu = new SelectMenuBuilder()
            .setCustomId('select_search_song');
        //.setPlaceholder('Nothing selected');
        for (const song of songs) {
            selectMenu.addOptions({
                label: song.title,
                description: song.album + ", " + song.artist,
                value: song.key,
            });
        }
        const response = await bot.setSelectMenu(selectMenu);
        await interaction.reply(response);
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
//# sourceMappingURL=search.js.map