import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder } from "discord.js";
import { SlashCommandBuilder } from '@discordjs/builders';
export const command = {
    data: new SlashCommandBuilder()
        .setName('viewqueue')
        .setDescription('View the queue.'),
    async execute(interaction, bot) {
        const queue = bot.getQueue().getSongs();
        const selectMenu = new SelectMenuBuilder()
            .setCustomId('select_queue_song');
        //.setPlaceholder('Nothing selected');
        for (let i = 0; i < queue.length; i++) {
            selectMenu.addOptions({
                label: queue[i].title,
                description: queue[i].album + ", " + queue[i].artist,
                value: i.toString(),
            });
        }
        const rowSelectMenu = new ActionRowBuilder()
            .addComponents(selectMenu);
        const rowButtonMenu = new ActionRowBuilder()
            .addComponents(new ButtonBuilder()
            .setCustomId('restartQueueButton')
            .setLabel('Restart')
            .setStyle(ButtonStyle.Success), new ButtonBuilder()
            .setCustomId('clearQueueButton')
            .setLabel('Clear')
            .setStyle(ButtonStyle.Danger));
        const restartQueueButtonHandler = async (interaction) => {
            if (!interaction.isButton())
                return;
            if (interaction.customId === 'restartQueueButton') {
                bot.getQueue().resetIndex();
                bot.getClient().removeListener('interactionCreate', restartQueueButtonHandler);
            }
        };
        bot.getClient().on('interactionCreate', restartQueueButtonHandler);
        const clearQueueButtonHandler = async (interaction) => {
            if (!interaction.isButton())
                return;
            if (interaction.customId === 'clearQueueButton') {
                bot.getQueue().reset();
                bot.getClient().removeListener('interactionCreate', clearQueueButtonHandler);
            }
        };
        bot.getClient().on('interactionCreate', clearQueueButtonHandler);
        await interaction.reply({
            content: "Queue :",
            components: [rowSelectMenu, rowButtonMenu]
        });
    },
};
//# sourceMappingURL=viewqueue.js.map