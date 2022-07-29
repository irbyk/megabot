/* eslint-disable @typescript-eslint/no-explicit-any */
import os from 'os';
import { v4 as uuid } from 'uuid';
import url from 'url';
import { XMLParser } from 'fast-xml-parser';
import fetch from 'node-fetch';
import { attach } from '../uri.js';
// var os = require('os');
// var uuid = require('uuid');
// var url = require('url');
// var xml2js = require('xml2js');
// const headers = require('plex-api-headers');

// var uri = require('./uri');

// Plex API header : https://github.com/phillipj/node-plex-api-headers/blob/master/index.js
function withoutNulls(obj: any) {
    return obj && Object.keys(obj).reduce(function (sum: any, curr: any) {
        if (typeof obj[curr] === 'string') {
            sum[curr] = obj[curr];
        }
        return sum;
    }, {});
}

function headers(plexApi: any, extraHeaders: any) {
    if (typeof plexApi !== 'object') {
        throw new TypeError('A PlexAPI object containing .options is required');
    }

    const options = plexApi.options;
    extraHeaders = withoutNulls(extraHeaders) || {};

    return Object.assign(extraHeaders, {
        'X-Plex-Client-Identifier': options.identifier,
        'X-Plex-Product': options.product,
        'X-Plex-Version': options.version,
        'X-Plex-Device': options.device,
        'X-Plex-Device-Name': options.deviceName,
        'X-Plex-Platform': options.platform,
        'X-Plex-Platform-Version': options.platformVersion,
        'X-Plex-Provides': 'controller'
    });
}


const PLEX_SERVER_PORT = "32400";
const xmlParser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix : 'attributes'
});

export interface PlexAPIConfig {
	hostname	: string;
	port	: string;
	token	: string;
	https?: boolean;
	requestOptions?: string;
	timeout?: string;
	authenticator?: string;
	options	: PlexAPIOptions;
}

export interface PlexAPIOptions {
	identifier?	: string;
	product?	: string;
	version?	: string;
	deviceName?	: string;
	platform?	: string;
	device?	: string;
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

export class PlexAPI {

	protected hostname: string;
	protected port: string;
	protected https: boolean;
	protected requestOptions?: any;
	protected timeout?: string;
	protected managedUser?: string;
	protected token: string;
	protected options: PlexAPIOptions;
	protected serverUrl: string;


	constructor(options: PlexAPIConfig) {
		const opts = options;
		const hostname = typeof options === 'string' ? options : options.hostname;

		this.hostname = hostname;
		this.port = opts.port || PLEX_SERVER_PORT;
		this.https = opts.https || false;
		this.requestOptions = opts.requestOptions || {};
		this.timeout = opts.timeout;
		this.token = opts.token;
		this.options = opts.options || {};
		this.options.identifier = this.options.identifier || uuid();
		this.options.product = this.options.product || 'Node.js App';
		this.options.version = this.options.version || '1.0';
		this.options.device = this.options.device || os.platform();
		this.options.deviceName = this.options.deviceName || 'Node.js App';
		this.options.platform = this.options.platform || 'Node.js';
		this.options.platformVersion = this.options.platformVersion || process.version;

		console.debug(JSON.stringify(options));
		if (typeof this.hostname !== 'string') {
			throw new TypeError('Invalid Plex Server hostname');
		}

		this.serverUrl = hostname + ':' + this.port;
	}

	public getHostname() {
		return this.hostname;
	}

	public getPort() {
		return this.port;
	}

	public getIdentifier() {
		return this.options.identifier;
	}

	public query(option: QueryOption | string) {
		const options: QueryOption = (typeof option === 'string')? { 
			uri: option,
			method: 'GET',
			parseResponse: true
		}: option;

		if (options.uri === undefined) {
			throw new TypeError('Requires uri parameter');
		}
		return this._request(options).then(attach(options.uri)) as Promise<any>;
	}

	public postQuery(options: any) {
		if (typeof options === 'string') {
			// Support old method of only supplying a single `url` parameter
			options = { uri: options };
		}
		if (options.uri === undefined) {
			throw new TypeError('Requires uri parameter');
		}
	
		options.method = 'POST';
		options.parseResponse = true;
	
		return this._request(options).then(attach(url));
	}

	public putQuery(options: any) {
		if (typeof options === 'string') {
			// Support old method of only supplying a single `url` parameter
			options = { uri: options };
		}
		if (options.uri === undefined) {
			throw new TypeError('Requires uri parameter');
		}
	
		options.method = 'PUT';
		options.parseResponse = true;
	
		return this._request(options).then(attach(url));
	}

	public deleteQuery(options: any) {
		if (typeof options === 'string') {
			// Support old method of only supplying a single `url` parameter
			options = { uri: options };
		}
		if (options.uri === undefined) {
			throw new TypeError('Requires uri parameter');
		}
	
		options.method = 'DELETE';
		options.parseResponse = false;
	
		return this._request(options);
	}

	public perform(options: any) {
		if (typeof options === 'string') {
			// Support old method of only supplying a single `url` parameter
			options = { uri: options };
		}
		if (options.uri === undefined) {
			throw new TypeError('Requires uri parameter');
		}
	
		options.method = 'GET';
		options.parseResponse = false;
	
		return this._request(options);
	}

	public find(options: any, criterias: any) {
		if (typeof options === 'string') {
			// Support old method of only supplying a single `url` parameter
			options = { uri: options };
		}
		if (options.uri === undefined) {
			throw new TypeError('Requires uri parameter');
		}
	
		return this.query(options).then(function (result) {
			const children = result._children || result.MediaContainer.Server;
			return filterChildrenByCriterias(children, criterias);
		});
	}

	public async _request(options: any) {
		const reqUrl = this._generateRelativeUrl(options.uri);
		const method = options.method;
		const timeout = this.timeout;
		const parseResponse = options.parseResponse;
		const extraHeaders = options.extraHeaders || {};
		//const self = this;
		const requestHeaders = headers(
			this,
			Object.assign(
				{
					Accept: 'application/json',
					'X-Plex-Token': this.token,
				},
				extraHeaders)
		);
		const reqOpts = {
			uri: new url.URL(reqUrl),
			encoding: null,
			method: method || 'GET',
			timeout: timeout,
			gzip: true,
			headers: requestHeaders,
			...this.requestOptions,
		};

		const response = await fetch(reqOpts.uri.href, reqOpts);

		// 403 forbidden when managed user does not have sufficient permission
		if (response.status === 403) {
			return new Error(
				'Plex Server denied request due to lack of managed user permissions ! ' +
				'In case of a delete request, delete content mustbe allowed in plex-media-server options.'
			);
		}

		// 401 unauthorized when authentication is required against the requested URL
		if (response.status === 401) {
			return new Error(
				'Plex Server denied request'
			);
		}

		if (response.status < 200 || response.status > 299) {
			return new Error(
				'Plex Server didnt respond with a valid 2xx status code, response code: ' + response.status
			);
		}

		// prevent holding an open http agent connection by pretending to consume data,
		// releasing socket back to the agent connection pool: http://nodejs.org/api/http.html#http_agent_maxsockets
		//response.on('data', function onData() {});
		const body = await response.text();
		return parseResponse ? this.ResponseParser(response, body) : undefined;
	}


	public _serverScheme() {
		if (typeof this.https !== 'undefined') {
			// If https is supplied by the user, always do what it says
			return this.https ? 'https://' : 'http://';
		}
		// Otherwise, use https if it's on port 443, the standard https port.
		return this.port === "443" ? 'https://' : 'http://';
	}

	public _generateRelativeUrl(relativeUrl: string) {
		return this._serverScheme() + this.serverUrl + relativeUrl;
	}

	private ResponseParser(response: any, body: any ) {
		if (response.headers.get('Content-Type') === 'application/json') {
			return Promise.resolve(body).then(JSON.parse);
		} else if (!response.headers.get('Content-Type') || response.headers.get('Content-Type').indexOf('xml') <= -1) {
			return Promise.resolve(body);
		} else {
			return xmlParser.parse(body);
		}
	}
}


function filterChildrenByCriterias(children: any, criterias: any) {
    const context = {
        criterias: criterias || {},
    };

    return children.filter(criteriasMatchChild, context);
}


function criteriasMatchChild(this: any, child: any) {
    const criterias = this.criterias;

    return Object.keys(criterias).reduce(function matchCriteria(hasFoundMatch, currentRule) {
        const regexToMatch = new RegExp(criterias[currentRule]);
        return regexToMatch.test(child[currentRule]);
    }, true);
}