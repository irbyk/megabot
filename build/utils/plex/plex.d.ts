import { PlexAPI, PlexAPIConfig } from "./plexAPI.js";
export interface PlexResponseAlbum {
    MediaContainer: {
        size: number;
        allowCameraUpload: boolean;
        allowChannelAccess: boolean;
        allowMediaDeletion: boolean;
        allowSharing: boolean;
        allowSync: boolean;
        allowTuners: boolean;
        backgroundProcessing: boolean;
        certificate: boolean;
        companionProxy: boolean;
        countryCode: string;
        diagnostics: string;
        eventStream: boolean;
        friendlyName: string;
        hubSearch: boolean;
        itemClusters: boolean;
        livetv: number;
        machineIdentifier: string;
        mediaProviders: boolean;
        multiuser: boolean;
        musicAnalysis: number;
        myPlex: boolean;
        myPlexMappingState: string;
        myPlexSigninState: string;
        myPlexSubscription: boolean;
        myPlexUsername: string;
        offlineTranscode: number;
        ownerFeatures: string;
        photoAutoTag: boolean;
        platform: string;
        platformVersion: string;
        pluginHost: boolean;
        pushNotifications: boolean;
        readOnlyLibraries: boolean;
        streamingBrainABRVersion: number;
        streamingBrainVersion: number;
        sync: boolean;
        transcoderActiveVideoSessions: number;
        transcoderAudio: boolean;
        transcoderLyrics: boolean;
        transcoderPhoto: boolean;
        transcoderSubtitles: boolean;
        transcoderVideo: boolean;
        transcoderVideoBitrates: string;
        transcoderVideoQualities: string;
        transcoderVideoResolutions: string;
        updatedAt: number;
        updater: boolean;
        version: string;
        voiceSearch: boolean;
        Directory: any[];
    };
}
export interface PlexResponseQuery {
    MediaContainer: {
        /** Number of result for this response.*/
        size: number;
        /** Number of total result */
        totalSize: number;
        /** Offset for the first result of this response.*/
        offset: number;
        identifier: string;
        mediaTagPrefix: string;
        mediaTagVersion: number;
        /** item list */
        Metadata: PlexResponseMetadata[];
    };
}
export interface PlexResponseMetadata {
    allowSync: boolean;
    librarySectionID: number;
    /** Title of the library where the object come from. */
    librarySectionTitle: string;
    librarySectionUUID: string;
    parentKey: string;
    personal: boolean;
    sourceTitle: string;
    ratingKey: string;
    key: string;
    parentRatingKey: string;
    grandparentRatingKey: string;
    guid: string;
    parentGuid: string;
    grandparentGuid: string;
    parentStudio: string;
    type: string;
    title: string;
    grandparentKey: string;
    grandparentTitle: string;
    parentTitle: string;
    summary: string;
    index: number;
    parentIndex: number;
    ratingCount: number;
    parentYear: number;
    thumb: string;
    art: string;
    parentThumb: string;
    parentArt: string;
    grandparentThumb: string;
    grandparentArt: string;
    duration: number;
    addedAt: number;
    updatedAt: number;
    musicAnalysisVersion: string;
    originalTitle: string;
    Media: PlexResponseMedia[];
}
export interface PlexResponseMedia {
    id: number;
    duration: number;
    bitrate: number;
    audioChannels: number;
    audioCodec: string;
    container: string;
    Part: PlexResponsePart[];
}
export interface PlexResponsePart {
    id: number;
    key: string;
    duration: number;
    file: string;
    size: number;
    container: string;
}
export interface PlexSong {
    artist: string;
    title: string;
    key: string;
    album: string;
    url: string;
    pictureURL: string;
}
export interface PlexTrack {
    duration: number;
    art: string;
    thumb: string;
    index: number;
    title: string;
    key: string;
    summary: string;
    type: string;
    bitrate: number;
    id: number;
    audioCodec: string;
    container: string;
    file: string;
    size: number;
    artist: string;
    album: string;
}
export declare enum PlexType {
    SONG = 10,
    ARTIST = 8
}
export declare class Plex extends PlexAPI {
    private offset;
    private pageSize;
    constructor(options: PlexAPIConfig);
    sendQuery(query: string, type: number): Promise<PlexResponseQuery>;
    getTracksFromName(name: string): Promise<PlexTrack[]>;
    getSongsFromName(name: string): Promise<PlexSong[]>;
    private generateURLFromKey;
}
//# sourceMappingURL=plex.d.ts.map