import { PlexAPI } from "./plexAPI.js";
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
            songs.push(trackToSong(track, this.generateURLFromKey.bind(this)));
        }
        return songs;
    }
    generateURLFromKey(key) {
        return (this.https ? 'https://' : 'http://') + this.hostname + ':' + this.port + key + '?X-Plex-Token=' + this.token;
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
        key: data.Media[0].Part[0].key,
        size: data.Media[0].Part[0].size,
        summary: data.summary,
        thumb: data.thumb,
        title: data.title,
        type: data.type,
        artist: data.originalTitle || data.grandparentTitle,
        album: data.parentTitle,
    };
}
function trackToSong(track, generateURL = () => { return ''; }) {
    return {
        album: track.album,
        artist: track.artist,
        key: track.key,
        title: track.title,
        url: generateURL(track.key),
        pictureURL: generateURL(track.thumb),
    };
}
//# sourceMappingURL=plex.js.map