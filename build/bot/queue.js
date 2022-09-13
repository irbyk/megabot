export class Queue {
    songs;
    index;
    finished;
    constructor() {
        this.songs = [];
        this.index = 0;
        this.finished = true;
    }
    setIndex(index) {
        this.index = index;
    }
    getIndex() {
        return this.index;
    }
    getLenght() {
        return this.songs.length;
    }
    getLenghtSongLeft() {
        return this.getLenght() - this.getIndex();
    }
    getSongs() {
        return this.songs;
    }
    next() {
        if (this.getIndex() >= this.songs.length) {
            this.finished = true;
            throw new Error("No song left to be played.");
        }
        const song = this.songs[this.getIndex()];
        this.setIndex(this.getIndex() + 1);
        return song;
    }
    start() {
        if (this.index >= this.songs.length) {
            throw new Error("No song be played.");
        }
        return this.songs[this.index];
    }
    resetIndex() {
        this.index = 0;
        if (this.songs.length > 0) {
            this.finished = false;
        }
    }
    clearSongs() {
        this.songs = [];
        this.finished = false;
    }
    reset() {
        this.clearSongs();
        this.resetIndex();
    }
    push(song) {
        this.finished = false;
        this.songs.push(song);
    }
}
//# sourceMappingURL=queue.js.map