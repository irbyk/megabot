import { PlexAPIConfig } from "./plex/plexAPI.js";
import { readFile } from "fs/promises";

export interface Config {
	listen_channel: string;
	command_character: string;
	playlist_directory : string;
	language : string;
}

export interface Key {
	botToken: string;
}

export async function loadConfig(): Promise<Config> {
	const file = await readFile("config/config.json");
	const config = JSON.parse(file.toString()) as Config;
	return config;
}

export async function loadKey(): Promise<Key> {
	const file = await readFile("config/keys.json");
	const key = JSON.parse(file.toString()) as Key;
	return key;

}

export async function loadConfigPlex(): Promise<PlexAPIConfig> {
	const file = await readFile("config/plex.json");
	const configPlex = JSON.parse(file.toString()) as PlexAPIConfig;
	return configPlex;
}