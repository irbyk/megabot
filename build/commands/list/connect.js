import { SlashCommandBuilder } from '@discordjs/builders';
export const command = {
    data: new SlashCommandBuilder()
        .setName('connect')
        .setDescription('Connect to the voice channel given, or if none is given the on,e where you are connected.')
        .addStringOption(option => option
        .setName('channel')
        .setDescription('Enter the channel\'s name')
        .setRequired(false)),
    async execute(interaction, bot) {
        const channelName = interaction.options.getString('name');
        if (channelName === null) {
            const voiceChannel = interaction.member.voice.channel;
            if (voiceChannel) {
                try {
                    bot.connectToVoicChannel(voiceChannel);
                }
                catch (error) {
                    console.error(error);
                }
                await interaction.reply('Connected !');
            }
            else {
                await interaction.reply('Please provide a voice channel name or connect to one.');
            }
            return;
        }
        const voiceChannel = bot.searchVoiceChannel(channelName);
        if (voiceChannel === undefined) {
            await interaction.reply(`There is no voice channel named "${channelName}".`);
            return;
        }
        try {
            bot.connectToVoicChannel(voiceChannel);
            await interaction.reply('Connected !');
        }
        catch (error) {
            console.error(error);
        }
    },
};
//# sourceMappingURL=connect.js.map