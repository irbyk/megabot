import {jest} from '@jest/globals';
import { ClientOptions} from "discord.js";

// const mock = jest.mock('discord.js', () => {
// 	const originalModule = jest.requireActual('discord.js');
// 	return {
// 		__esModule: true,
// 		...originalModule,
// 		Client: jest.fn().mockImplementation(() => {
// 			return {
// 				user: 'user-test',
// 				guilds: {
// 					fetch: () => {return {
// 						map: () => {}
// 					}},
					
// 				},
// 				on: jest.fn().mockImplementation(() => {})
// 			}
// 		})
// 	}
// });

jest.mock('discord.js', () => {
  return jest.fn().mockImplementation(() => {
    return {Client : jest.fn().mockImplementation(() =>  {return {
		user: 'user-test',
		guilds: {
		fetch: () => {return {
			map: () => {}
		}},
		
		},
		on: jest.fn().mockImplementation(() => {}),
		destroy: jest.fn<() => void>(),
		}
	})};
  });
});


export async function getMockClient(options: ClientOptions = {intents: []}) {
	const {Client} = await import('discord.js');
	const client = new Client(options);
	console.dir(client);
	return client;
}