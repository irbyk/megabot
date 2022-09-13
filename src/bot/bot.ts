import { ChannelType, Client, InteractionReplyOptions, ActionRowBuilder, ButtonBuilder, EmbedBuilder, VoiceBasedChannel, ButtonStyle, Interaction, CacheType, SelectMenuBuilder } from "discord.js";
import { initializeCommand } from "../commands/command.js";
import { Plex, PlexSong } from "../utils/plex/plex.js"
import { PlexAPIConfig } from "../utils/plex/plexAPI.js";
import { AudioPlayer, AudioResource, createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnection, AudioPlayerStatus, VoiceConnectionStatus, NoSubscriberBehavior, VoiceConnectionState } from "@discordjs/voice";
import fetch from "node-fetch";

import { Readable } from "stream";
import EventEmitter from "events";

export enum BotEvent {
	Ready = "ready",
	Played = "played",
	Stopped = "stopped",
	Paused = "paused",
	Unpause = "unpause",
	Started = "started",
	SongLoaded = "songLoaded",
	ConnectedToVoiceChannel = "connectedToVoiceChannel",
	Skipped = "skipped",

}

export class Bot extends EventEmitter {
	private client: Client;
	private plex: Plex;
	private song: Song | undefined;
	private voiceConnection: VoiceConnection | undefined
	private player: AudioPlayer;
	private playing: boolean;
	private paused: boolean;
	private initialized: boolean;
	private songQueue: Song[];
	private songInteraction: InteractionReplyOptions | undefined;

	constructor(client: Client, plexConfig: PlexAPIConfig) {
		super({captureRejections: true});
		this.on('error', (error) => {
			console.log("Error throw on event handling with the bot.");
			console.error(error)
		});
		
		this.client = client;
		this.client.on('error', (error) => {
			console.log("Error throw on event handling with the client.");
			console.error(error)
		});
		this.plex = new Plex(plexConfig);
		this.player = createAudioPlayer({
			behaviors: {
				noSubscriber: NoSubscriberBehavior.Pause,
			},
		});
		this.playing = false;
		this.paused = false;
		this.initialized = false;
		this.player.on(AudioPlayerStatus.Playing, () => {
			this.playing = true;
			this.paused = false;
			console.log("AudioPlayerStatus.Playing");
		})
		this.player.on('stateChange', (oldState, newState) => {
			console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
		});
		this.player.on("error" , (error) => {
			console.log(`Audio player raise ${error}`);
			console.error(error);
		});
		this.player.on(AudioPlayerStatus.Idle, () => {
			this.paused = false;
			this.playing = false;
			this.song = undefined;
			if (this.songQueue.length > 0) {
				this.song = this.songQueue.shift();
				this.playSong(this.song);
			}
			this.emit(BotEvent.Stopped);
			console.log("AudioPlayerStatus.Idle");
		});
		this.player.on(AudioPlayerStatus.Paused, () => {
			this.paused = true;
			console.log("AudioPlayerStatus.Paused");
		});
		this.player.on(AudioPlayerStatus.AutoPaused, () => {
			this.paused = true;
			console.log("AudioPlayerStatus.AutoPaused");
		});
		this.player.on(AudioPlayerStatus.Buffering, () => {
			this.paused = true;
			console.log("AudioPlayerStatus.Buffering");
		});

		this.songQueue = [];
		}

	public isPlaying() {
		return this.playing;
	}

	public isPaused() {
		return this.paused;
	}

	public isInVocalChannel() {
		return this.voiceConnection !== undefined &&
				!(this.voiceConnection.state.status === VoiceConnectionStatus.Disconnected ||
				this.voiceConnection.state.status === VoiceConnectionStatus.Destroyed);
	}

	public setInitialize(value: boolean) {
		if(!this.initialized && value) {
			this.initialized = value;
			this.emit(BotEvent.Ready);
		} else {
			throw new Error("The bot is already initialized.")
		}
	}

	public isInitialized(): boolean {
		return this.initialized;
	}

	async start(botToken: string) {
		if(!this.initialized) {
			throw new Error("Should be initialize before start.");
		}
		console.dir(initializeCommand);
		await this.client.login(botToken);
		this.emit(BotEvent.Started);
	}

	public async searchSong(songName: string): Promise<PlexSong> {
		return (await this.plex.getSongsFromName(songName))[0];
	}

	public async searchSongs(songName: string): Promise<Song[]> {
		return (await this.plex.getSongsFromName(songName)).map(song => new Song(song) );
	}

	public async getSongInteraction(): Promise<InteractionReplyOptions> {
		if (this.songInteraction === undefined) {
			throw new Error("No song interaction has been created.")
		}
		return this.songInteraction;
	}

	public loadSong(song: PlexSong) {
		if (this.song === undefined) {
			this.song = new Song(song);
		} else {
			this.songQueue.push(new Song(song));
		}
		this.emit(BotEvent.SongLoaded, this.song);
	}

	public searchVoiceChannel(name: string): VoiceBasedChannel | undefined {
		return (this.client.channels.cache.find(channel => channel.type === ChannelType.GuildVoice && channel.name === name) as VoiceBasedChannel);
	}

	public connectToVoicChannel(voiceChannel: VoiceBasedChannel): void {
		this.voiceConnection = joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: voiceChannel.guild.id,
			adapterCreator: voiceChannel.guild.voiceAdapterCreator,
		})
		this.voiceConnection.subscribe(this.player);
		this.voiceConnection.on(VoiceConnectionStatus.Disconnected, async () => {
			console.log('Disconnected from vocal channel.')

		});
		this.voiceConnection.on(VoiceConnectionStatus.Signalling, () => {
			if (!this.isPlaying()) return;
			this.voiceConnection?.rejoin(this.voiceConnection.joinConfig);
		})
		this.voiceConnection.on("error" , (error) => {
			console.log(`voiceConnection raise ${error}`);
			console.error(error);
		});
		this.voiceConnection.on('debug', console.log);
		const voiceChannelName = voiceChannel.name;
		const handlerDisconnectTest = (oldState: VoiceConnectionState, newState: VoiceConnectionState) => {
			// console.dir(newState, {depth: 5});
			console.log(`voiceConnection transitioned from ${oldState.status} to ${newState.status}`);

			// if (newState.status === 'signalling' && oldState.status === newState.status) {
			// 	this.voiceConnection?.removeListener("stateChange", handlerDisconnectTest);
			// 	console.log("Disconnect");
			// 	this.voiceConnection?.disconnect();
			// 	console.log("Destroy");
			// 	this.voiceConnection?.destroy();
			// 	console.log("Reconnect");
			// 	const voiceChannelReco = this.searchVoiceChannel(voiceChannelName);
			// 	if( voiceChannelReco === undefined) {
			// 		throw new Error(`The voice channel "${voiceChannelName}" cannot be find.`)
			// 	}
			// 	this.connectToVoicChannel(voiceChannelReco);
				
			// }
		};
		this.voiceConnection.on("stateChange" , handlerDisconnectTest);
		this.emit(BotEvent.ConnectedToVoiceChannel, voiceChannel);
	}

	public async play() {
		if (this.voiceConnection === undefined) {
			throw new Error("The bot is not connected to a voice channel");
		}
		if (this.playing) {
			throw new Error("The bot is already playing.");
		}
		await this.playSong(this.song);
		this.emit(BotEvent.Played);
	}

	public async testPlay() {
		if (this.voiceConnection === undefined) {
			throw new Error("The bot is not connected to a voice channel");
		}
		// if (this.playing) {
		// 	throw new Error("The bot is already playing.");
		// }
		const audioRessourceTest = createAudioResource("test.mp3");
		this.player.on('debug', console.log);
		this.player.on('error', console.error);
		this.player.play(audioRessourceTest);
		this.emit(BotEvent.Played);
	}

	public async playSong(song: Song | undefined) {
		if (song === undefined) {
			throw new Error("No song to be played.");
		}
		await this.plex.loadSong(song);
		if (song.loaded) {
			this.songInteraction = await this.generateSongInteraction(song);
			this.player.play(song.ressource as AudioResource);
		}
	}

	public pause() {
		if (this.playing) {
			if (this.player.pause(true)) {
				//this.paused = true;
				return;
			}
			throw new Error("The bot cannot be paused for unknow reason.");
		}
		throw new Error("The bot cannot be paused because it is not playing.");
	}

	public unpause() {
		if(this.paused) {
			if(this.player.unpause()) {
				return;
			}
			throw new Error("The bot cannot be unpaused for unknown reason.")
		}
		throw new Error("The bot cannot be unpaused because it is not paused.");
	}
	public skip() {
		const songSkipped = this.song;
		this.player.stop();
		this.emit(BotEvent.Skipped, songSkipped);
	}

	public stop() {
		this.songQueue = [];
		this.player.stop();
	}

	public destroy(): void {
		this.client.destroy();
	}

	private async generateSongInteraction(song: PlexSong, isPaused = false): Promise<InteractionReplyOptions> {
		try {
			const imageBuffer = await this.plex.loadPicture(song);
			const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('playButton')
					.setLabel(isPaused ? 'Resume' : 'Pause')
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId('stopButton')
					.setLabel('Stop')
					.setStyle(ButtonStyle.Danger),
			);
			const embed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTitle(`${song.title}`)
			.setDescription(`Artist : ${song.artist}\n Album : ${song.album}`)
			.setImage('attachment://cover.jpg');
			const buttonPlayHandler =  async (interaction: Interaction<CacheType>) => {
				if (!interaction.isButton()) return;
				if (interaction.customId === 'playButton') {
					console.log(interaction.message.components[0].components[0]);
					if(this.isPaused()) {
						this.unpause();
						//await interaction.deferUpdate();
						const songInteraction = await this.generateSongInteraction(song, false);
						await interaction.update({
							components : songInteraction.components,
						});
					} else {
						this.pause();
						//await interaction.deferUpdate();
						const songInteraction = await this.generateSongInteraction(song, true);
						await interaction.update({
							components : songInteraction.components,
						});
					}
					this.client.removeListener('interactionCreate', buttonPlayHandler);
				}
				// console.log(interaction);
			}
			this.client.on('interactionCreate', buttonPlayHandler);

			const stopButtonHandler = async (interaction: Interaction<CacheType>) => {
				if (!interaction.isButton()) return;
				if (interaction.customId === 'stopButton') {
					this.stop();
					await interaction.update({
						content: 'The bot has been stop.',
						components: [],
					});
					this.client.removeListener('interactionCreate', buttonPlayHandler);
				}
			}
			this.client.on('interactionCreate', stopButtonHandler);
			return {
				content: `Artist : ${song.artist}, album : ${song.album}, title: ${song.title}`,
				embeds: [embed],
				components: [row],
				files: [{
					attachment: Buffer.from(imageBuffer),
					name: "cover.jpg"
				}],
			}
		} catch (err) {
			console.error(err);
			return {
				content: `Artist : ${song.artist}, album : ${song.album}, title: ${song.title}.\n`
				+ 'An error occured when generating this message.',
			}
		}
	}

	public async setSelectMenu(selectMenu: SelectMenuBuilder): Promise<InteractionReplyOptions>{
		const row = new ActionRowBuilder<SelectMenuBuilder>()
			.addComponents(selectMenu);
		this.client.on('interactionCreate', async interaction => {
			if (!interaction.isSelectMenu()) return;
			if (interaction.customId === selectMenu.data.custom_id) {
				const song = new Song(await this.plex.getSongFromKey(interaction.values[0]));
				console.log("Song selected : ");
				console.dir(song);
				const songInteraction = await this.generateSongInteraction(song);
				await interaction.update({
					content: songInteraction.content,
					embeds: songInteraction.embeds,
					components: songInteraction.components,
					files: songInteraction.files
				});
				if (this.isInVocalChannel() && !this.isPlaying()) {
					this.playSong(song)
				} else {
					this.songQueue.push(song);
				}
			}
		});
		return {
			content : 'Select Menu',
			components: [row]
		}
	}
}

export interface SongJSON {
	album: string;
	artist: string;
	key: string;
	mediaKey: string;
	title: string;
	pictureKey: string;

}

export class Song implements PlexSong {
	
	public album: string;
	public artist: string;
	public key: string;
	public mediaKey: string;
	public title: string;
	//public url: string;
	public ressource: AudioResource | undefined;
	public loaded: boolean;
	public pictureKey: string;


	constructor(song: PlexSong) {
		this.album = song.album;
		this.artist = song.artist;
		this.key = song.key;
		this.mediaKey = song.mediaKey,
		this.title = song.title;
		//this.url = song.url;
		this.loaded = song.loaded;
		this.pictureKey = song.pictureKey;
		this.ressource = song.ressource;
	}

	public toJSON(): SongJSON {
		return {
			album: this.album,
			artist: this.artist,
			key: this.key,
			mediaKey: this.mediaKey,
			pictureKey: this.pictureKey,
			title: this.title
		}
	}

	public static fromJSON(songJSON: SongJSON): PlexSong {
		return new Song({
			album: songJSON.album,
			artist: songJSON.artist,
			key: songJSON.key,
			mediaKey: songJSON.mediaKey,
			loaded: false,
			pictureKey: songJSON.pictureKey,
			ressource: undefined,
			title: songJSON.title
		});
	}

}