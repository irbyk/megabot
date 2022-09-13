import { Song } from "./song.js";


export class Queue {
	private songs: Song[];
	private index: number;
	private finished: boolean;

	constructor() {
		this.songs = [];
		this.index = 0;
		this.finished = true;
	}

	public setIndex(index: number) {
		this.index = index;
	}

	public getIndex(): number {
		return this.index;
	}

	public getLenght(): number {
		return this.songs.length;
	}

	public getLenghtSongLeft(): number {
		return this.getLenght() - this.getIndex();
	}

	public getSongs(): Song[] {
		return this.songs;
	}

	public next(): Song {
		if(this.getIndex() >= this.songs.length) {
			this.finished = true;
			throw new Error("No song left to be played.");
		}
		const song = this.songs[this.getIndex()];
		this.setIndex(this.getIndex()+1);

		return song;
	}

	public start(): Song {
		if(this.index >= this.songs.length) {
			throw new Error("No song be played.");
		}

		return this.songs[this.index];
	}

	public resetIndex(): void {
		this.index = 0;
		if (this.songs.length > 0 ) {
			this.finished = false;
		}
	}

	public clearSongs(): void {
		this.songs = [];
		this.finished = false;
	}

	public reset(): void {
		this.clearSongs();
		this.resetIndex();
	}

	public push(song: Song): void {
		this.finished = false;
		this.songs.push(song);
	}

}