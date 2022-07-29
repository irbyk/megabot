export interface PlexAPIConfig {
    hostname: string;
    port: string;
    token: string;
    https?: boolean;
    requestOptions?: string;
    timeout?: string;
    authenticator?: string;
    options: PlexAPIOptions;
}
export interface PlexAPIOptions {
    identifier?: string;
    product?: string;
    version?: string;
    deviceName?: string;
    platform?: string;
    device?: string;
    platformVersion?: string;
}
interface Part {
    key: string;
}
interface Media {
    Part: Part[];
}
export interface Track {
    Media: Media[];
    title: string;
    originalTitle: string;
    grandparentTitle: string;
    parentTitle: string;
}
export interface Mood {
    name: string;
    key: string;
    url: string;
    id: number;
}
interface QueryOption {
    uri: string;
    method: string;
    parseResponse: boolean;
}
export declare class PlexAPI {
    protected hostname: string;
    protected port: string;
    protected https: boolean;
    protected requestOptions?: any;
    protected timeout?: string;
    protected managedUser?: string;
    protected token: string;
    protected options: PlexAPIOptions;
    protected serverUrl: string;
    constructor(options: PlexAPIConfig);
    getHostname(): string;
    getPort(): string;
    getIdentifier(): string | undefined;
    query(option: QueryOption | string): Promise<any>;
    postQuery(options: any): Promise<any>;
    putQuery(options: any): Promise<any>;
    deleteQuery(options: any): Promise<any>;
    perform(options: any): Promise<any>;
    find(options: any, criterias: any): Promise<any>;
    _request(options: any): Promise<any>;
    _serverScheme(): "https://" | "http://";
    _generateRelativeUrl(relativeUrl: string): string;
    private ResponseParser;
}
export {};
//# sourceMappingURL=plexAPI.d.ts.map