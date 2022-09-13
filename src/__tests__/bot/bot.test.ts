/* eslint-disable @typescript-eslint/no-empty-function */
import {jest} from '@jest/globals';

import { PlexAPIConfig } from '../../utils/plex/plexAPI.js';

jest.mock('discord.js', () => {
	const originalModule = jest.requireActual('discord.js') as Record<string, unknown>;
	return ({
		__esModule: true,
		...originalModule,
		Client : jest.fn().mockImplementation(() =>  {
			return {
				user: 'user-test',
				guilds: {
				fetch: () => {return {
					map: () => {}
				}},
				
				},
				on: jest.fn().mockImplementation(() => {}),
				destroy: jest.fn<() => void>(),
				login: jest.fn().mockImplementation(async () => {}),
			}
		}),
	});
});

const audioPlayerMock = {
	on: jest.fn(),
	stop: jest.fn(),
	pause: jest.fn(),
	unpause: jest.fn(),
	play: jest.fn(),

}

jest.mock('@discordjs/voice', () => {
	const originalModule = jest.requireActual('@discordjs/voice') as Record<string, unknown>;
	return ({
		__esModule: true,
		...originalModule,
		createAudioPlayer : jest.fn().mockImplementation(() => {
			return audioPlayerMock;
		}),
	});
});

const { Client } = await import('discord.js');
const { Bot, BotEvent } = await import('../../bot/bot.js');
function getMockClient() {
	return new Client(optionsClient);
}

const configPlex: PlexAPIConfig = {
	hostname: 'test',
	port: '0000',
	token: 'token-test',
	options: {}
}

const optionsClient = {intents: []};
const TOKEN_DISCORD_TEST = "token-discord-test";

//const mockedClient = jest.mocked(Client, true);
describe('Bot Creation', () => {

	// beforeEach( () => {
		
	// })

	it('Should create a bot wich is not initialized.', () => {
		const client = getMockClient();
		const bot = new Bot(client, configPlex);
		expect(bot.isInitialized()).toBe(false);
		bot.destroy();
	});

	it('Should create a bot wich is not playing.', async () => {
		const client = getMockClient();
		const bot = new Bot(client, configPlex);
		expect(bot.isPlaying()).toBe(false);
		bot.destroy();
	});

	it('Should create a bot wich is not paused.', () => {
		const client = getMockClient();
		const bot = new Bot(client, configPlex);
		expect(bot.isPaused()).toBe(false);
		bot.destroy();
	});

	it('Should not be in a vocal chat.', () => {
		const client = getMockClient();
		const bot = new Bot(client, configPlex);
		expect(bot.isInVocalChannel()).toBe(false);
	} )

});

describe('Bot destruction.', () => {
	it('Shoudl destroy the client when destroy itself.', () => {
		const client = getMockClient();
		const bot = new Bot(client, configPlex);
		bot.destroy();
		expect(client.destroy).toBeCalled();
	});
})

describe('Bot start.', () => {
	it('Should raise an error if start playing without being in voice channel', async () => {
		const client = getMockClient();
		const bot = new Bot(client, configPlex);
		expect(bot.start(TOKEN_DISCORD_TEST)).rejects.toThrowError("Should be initialize before start.");
		bot.destroy();
	});

	it('Should login the client if initialized.', async () => {
		const client = getMockClient();
		const bot = new Bot(client, configPlex);
		bot.setInitialize(true);
		const mockEmit = jest.spyOn(bot, 'emit');
		await bot.start(TOKEN_DISCORD_TEST);
		expect(client.login).toBeCalledWith(TOKEN_DISCORD_TEST);
		expect(mockEmit).toBeCalledWith(BotEvent.Started);
	});
});

describe('Bot play', () => {
	it('Should raise an error if start playing without being in voice channel', async () => {
		const client = getMockClient();
		const bot = new Bot(client, configPlex);
		expect(bot.play()).rejects.toThrowError("The bot is not connected to a voice channel");
		bot.destroy();
	});


})

describe('Bot pause', () => {

	it('Should raise an error if pause while not playing.', async () => {
		const client = getMockClient(); //  new Client(optionsClient)
		const bot = new Bot(client, configPlex);
		expect(() => bot.pause()).toThrowError("The bot cannot be paused because it is not playing.");
	})

})

describe('Bot stop', () => {

	it('Should raise emit a Stop event when stoped.', async () => {
		const client = getMockClient(); //  new Client(optionsClient)
		const functionMock = jest.fn();
		const bot = new Bot(client, configPlex);
		bot.on(BotEvent.Stopped, functionMock);
		bot.stop();
		expect(functionMock).toBeCalled();
	})

})