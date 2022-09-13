import { AudioResource } from "@discordjs/voice";
import { PlexSong } from "../utils/plex/plex.js";

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