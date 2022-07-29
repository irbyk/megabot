import { Client } from 'discord.js';
import { REST } from '@discordjs/rest';
//import { deploy } from '../../build/commands/command.js';

/*jest.mock('discord.js', () => {
	const originalModule = jest.requireActual('discord.js');
	return {
		__esModule: true,
		...originalModule,
		Client: jest.fn().mockImplementation(() => {
			return {
				user: 'user-test',
				guilds: {
					fetch: () => {return {
						map: () => {}
					}},
					
				},
				on: jest.fn().mockImplementation(() => {})
			}
		})
	}
});
jest.mock('@discordjs/rest', () => {
	const originalModule = jest.requireActual('@discordjs/rest');
	return {
		__esModule: true,
		...originalModule,
		Client: jest.fn().mockImplementation(() => {
			return {
				guilds: {
					fetch: () => {console.log('pouet')}
				}
			}
		})
	}
});
*/

describe('Command', () => {
	// const MockedClient = jest.mocked(Client, true);
	// MockedClient.guilds.mockReturnValue();
	test('Should deployed the command in the discord server.', async () => {
		/*const client = new Client({intents: []});
		await deploy(client);
		expect(client.on).toHaveBeenCalledTimes(1);
		expect(client.on).toBeCalledWith('guildCreate');*/
	});
});