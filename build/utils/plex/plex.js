import { Readable } from "stream";
import fetch from "node-fetch";
import { PlexAPI } from "./plexAPI.js";
import { createAudioResource } from "@discordjs/voice";
export var PlexType;
(function (PlexType) {
    PlexType[PlexType["SONG"] = 10] = "SONG";
    PlexType[PlexType["ARTIST"] = 8] = "ARTIST";
})(PlexType || (PlexType = {}));
export class Plex extends PlexAPI {
    offset;
    pageSize;
    constructor(options) {
        super(options);
        this.offset = 0;
        this.pageSize = 100;
    }
    async sendQuery(query, type) {
        const queryHTTP = encodeURI(query);
        return await this.query('/search/?type=' + type + '&query=' + queryHTTP + '&X-Plex-Container-Start=' + this.offset + '&X-Plex-Container-Size=' + this.pageSize);
    }
    async getTracksFromName(name) {
        const res = await this.sendQuery(name, PlexType.SONG);
        const tracks = [];
        if (res.MediaContainer.size === 0) {
            return tracks;
        }
        for (const data of res.MediaContainer.Metadata) {
            tracks.push(dataToTrack(data));
        }
        console.dir(res.MediaContainer.Metadata[0].Media[0].Part);
        return tracks;
    }
    async getSongsFromName(name) {
        const tracks = await this.getTracksFromName(name);
        const songs = [];
        for (const track of tracks) {
            songs.push(trackToSong(track));
        }
        return songs;
    }
    async getSongFromKey(key) {
        const queryHTTP = encodeURI(key);
        const res = await this.query(queryHTTP);
        console.dir(res);
        const track = dataToTrack(res.MediaContainer.Metadata[0]);
        return trackToSong(track);
    }
    generateURLFromKey(key) {
        return (this.https ? 'https://' : 'http://') + this.hostname + ':' + this.port + key + '?X-Plex-Token=' + this.token;
    }
    /**
     * Load the song from the plex server. Once the song is loaded, the attribute `loaded` will be set to true.
     */
    async loadSong(song) {
        if (song.loaded)
            return;
        const response = await fetch(this.generateURLFromKey(song.mediaKey));
        if (response.body === null)
            throw new Error(`"${song.mediaKey} is empty."`);
        const readstream = Readable.from(response.body, { highWaterMark: 20971520 });
        song.ressource = createAudioResource(readstream);
        song.loaded = true;
    }
    async loadPicture(song) {
        const imageResponse = await fetch(this.generateURLFromKey(song.pictureKey));
        const imageBuffer = await imageResponse.arrayBuffer();
        return imageBuffer;
    }
}
function dataToTrack(data) {
    console.debug('DataToTrack, data : ');
    console.dir(data);
    return {
        art: data.art || data.parentArt || data.grandparentArt,
        audioCodec: data.Media[0].audioCodec,
        bitrate: data.Media[0].bitrate,
        container: data.Media[0].container,
        duration: data.Media[0].duration,
        file: data.Media[0].Part[0].file,
        id: data.Media[0].id,
        index: data.index,
        key: data.key,
        mediaKey: data.Media[0].Part[0].key,
        size: data.Media[0].Part[0].size,
        summary: data.summary,
        thumb: data.thumb,
        title: data.title,
        type: data.type,
        artist: data.originalTitle || data.grandparentTitle,
        album: data.parentTitle,
    };
}
function trackToSong(track) {
    return {
        album: track.album,
        artist: track.artist,
        key: track.key,
        mediaKey: track.mediaKey,
        title: track.title,
        loaded: false,
        ressource: undefined,
        //url: generateURL(track.key),
        pictureKey: track.thumb,
    };
}
//# sourceMappingURL=plex.js.map