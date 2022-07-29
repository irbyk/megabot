import { SlashCommandBuilder } from '@discordjs/builders';
export const command = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the bot from playing.'),
    async execute(interaction, bot) {
        bot.stop();
        await interaction.reply("The bot is stoped, and the queue is cleared.");
    },
};
//# sourceMappingURL=stop.js.map