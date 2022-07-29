import { SlashCommandBuilder } from '@discordjs/builders';
import { BotEvent } from "../../bot/bot.js";
export const command = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the song currently playing.'),
    async execute(interaction, bot) {
        bot.skip();
        bot.once(BotEvent.Skipped, async (song) => {
            try {
                await interaction.reply(`${song.title} has been skipped.`);
            }
            catch (err) {
                console.error(err);
            }
        });
    },
};
//# sourceMappingURL=skip.js.map