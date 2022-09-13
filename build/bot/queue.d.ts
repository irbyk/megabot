import { Song } from "./song.js";
export declare class Queue {
    private songs;
    private index;
    private finished;
    constructor();
    setIndex(index: number): void;
    getIndex(): number;
    getLenght(): number;
    getLenghtSongLeft(): number;
    getSongs(): Song[];
    next(): Song;
    start(): Song;
    resetIndex(): void;
    clearSongs(): void;
    reset(): void;
    push(song: Song): void;
}
//# sourceMappingURL=queue.d.ts.map