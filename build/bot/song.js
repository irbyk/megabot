export class Song {
    album;
    artist;
    key;
    mediaKey;
    title;
    //public url: string;
    ressource;
    loaded;
    pictureKey;
    constructor(song) {
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
    toJSON() {
        return {
            album: this.album,
            artist: this.artist,
            key: this.key,
            mediaKey: this.mediaKey,
            pictureKey: this.pictureKey,
            title: this.title
        };
    }
    static fromJSON(songJSON) {
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
//# sourceMappingURL=song.js.map