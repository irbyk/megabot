import { SlashCommandBuilder } from '@discordjs/builders';
export const command = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current song.'),
    async execute(interaction, bot) {
        bot.pause();
        await interaction.reply("The bot is paused.");
    },
};
//# sourceMappingURL=pause.js.map