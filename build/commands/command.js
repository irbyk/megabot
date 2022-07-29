import { Collection, InteractionType } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import fs from 'fs';
import { loadConfig, loadKey } from '../utils/config.js';
// async function pouet() {
// const keys = await loadKey();
// const config = await loadConfig();
// const botToken = keys.botToken;
// const { listen_channel, command_character } = config;
export async function loadCommands() {
    const commandFiles = fs.readdirSync('build/commands/list').filter(file => file.endsWith('.js'));
    const commands = new Collection();
    for (const file of commandFiles) {
        const { command } = await import(`./list/${file.split('.js')[0]}.js`);
        console.debug(`command from file "${file}" :`);
        console.dir(command);
        commands.set(command.data.name, command);
    }
    return commands;
}
// const rest = new REST({ version: '9' }).setToken(botToken);
// }
export async function deploy(commands, client) {
    /// à retirer
    const keys = await loadKey();
    const botToken = keys.botToken;
    const rest = new REST({ version: '9' }).setToken(botToken);
    ///////////////////////////////////////////////////////////
    if (!client.user) {
        throw new Error('Client not connected.');
    }
    const clientId = client.user.id;
    const guilds = await client.guilds.fetch();
    guilds.map((guild => deployOneGuild(commands, client, guild.id)));
    client.on('guildCreate', (guild) => {
        if (!client.user) {
            throw new Error('Client not connected.');
        }
        rest.put(Routes.applicationGuildCommands(clientId, guild.id), { body: commands.map((command) => {
                command.data.toJSON;
            }) })
            .then(() => console.log('Successfully registered application commands.'))
            .catch(console.error);
    });
}
export async function deployOneGuild(commands, client, guildId) {
    /// à retirer+
    const keys = await loadKey();
    const botToken = keys.botToken;
    const rest = new REST({ version: '9' }).setToken(botToken);
    ///////////////////////////////////////////////////////////
    if (!client.user) {
        throw new Error('Client not connected.');
    }
    const clientId = client.user.id;
    const commandsJSON = commands.map((command) => {
        return command.data.toJSON();
    });
    return rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commandsJSON })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
}
export function initializeCommand(commands, client, bot) {
    client.on('interactionCreate', async (interaction) => {
        if (!(interaction.type === InteractionType.ApplicationCommand))
            return;
        if (!interaction.isChatInputCommand())
            return;
        const command = commands.get(interaction.commandName);
        if (!command)
            return;
        try {
            await command.execute(interaction, bot);
            if (!interaction.replied) {
                await interaction.reply({ content: 'No reply :cry:.', ephemeral: true });
            }
        }
        catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command !', ephemeral: true });
        }
    });
    client.on('messageCreate', async (message) => {
        const config = await loadConfig();
        const { listen_channel, command_character } = config;
        //////////////////////////////////
        if (!(listen_channel === '' || message.channel.name == listen_channel))
            return;
        const content = message.content;
        if (!content.startsWith(command_character))
            return;
        const cmdTxt = content.split(/\s+/)[0].substring(command_character.length, content.length).toLowerCase();
        if (cmdTxt === 'deploy') {
            if (!message.guildId) {
                throw new Error('Should have a guild id to this message.');
            }
            deployOneGuild(commands, client, message.guildId)
                .then(() => message.reply('Slash commands deployed.'))
                .catch(() => message.reply('Error during deployment of slash commands.'));
        }
    });
    bot.setInitialize(true);
}
//# sourceMappingURL=command.js.map