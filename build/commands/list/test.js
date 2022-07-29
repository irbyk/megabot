import { SlashCommandBuilder } from '@discordjs/builders';
export const command = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('PLay a local song to test the audio.'),
    async execute(interaction, bot) {
        await bot.testPlay();
        await interaction.reply("Start the test.");
    },
};
//# sourceMappingURL=test.js.map