import { SlashCommandBuilder } from '@discordjs/builders';
export const command = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the current paused song.'),
    async execute(interaction, bot) {
        bot.unpause();
        await interaction.reply("The bot is playing.");
    },
};
//# sourceMappingURL=resume.js.map