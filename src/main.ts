import { Client, Guild, GatewayIntentBits } from 'discord.js';
import { Bot, BotEvent } from './bot/bot.js';
import { deploy, initializeCommand, loadCommands } from './commands/command.js';
import { loadConfigPlex, loadKey } from './utils/config.js';


const  keys = await loadKey();
const configPlex = await loadConfigPlex();
const commands = await loadCommands();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildVoiceStates
	] });

const bot = new Bot(client, configPlex);

bot.once(BotEvent.Ready, () => {
	bot.start(keys.botToken);
})

//client.login(keys.botToken);
client.on('guildCreate', (guild: Guild) => {
	console.log(`join guild ${guild.id}, named "${guild.name}"`)
})


client.once('ready', async () => {
	console.log('Bot ready.');
	const guilds = await client.guilds.fetch();
	guilds.map((guild => console.log(`Is in the guild "${guild.name}", id ${guild.id}.`)));
	deploy(commands, client);
})





async function shutdown(){
	try {
		console.log('Bot shutdown');
	} catch (e: unknown){
		if (e instanceof Error) {
			console.error(e.toString());
		}
	} finally {
		bot.destroy();
		process.exit(0);
	}
}



process.on('SIGTERM', shutdown);

process.on('SIGINT', shutdown);

initializeCommand(commands, client, bot);