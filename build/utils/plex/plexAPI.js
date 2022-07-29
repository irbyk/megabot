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
function withoutNulls(obj) {
    return obj && Object.keys(obj).reduce(function (sum, curr) {
        if (typeof obj[curr] === 'string') {
            sum[curr] = obj[curr];
        }
        return sum;
    }, {});
}
function headers(plexApi, extraHeaders) {
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
    attributeNamePrefix: 'attributes'
});
export class PlexAPI {
    hostname;
    port;
    https;
    requestOptions;
    timeout;
    managedUser;
    token;
    options;
    serverUrl;
    constructor(options) {
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
    getHostname() {
        return this.hostname;
    }
    getPort() {
        return this.port;
    }
    getIdentifier() {
        return this.options.identifier;
    }
    query(option) {
        const options = (typeof option === 'string') ? {
            uri: option,
            method: 'GET',
            parseResponse: true
        } : option;
        if (options.uri === undefined) {
            throw new TypeError('Requires uri parameter');
        }
        return this._request(options).then(attach(options.uri));
    }
    postQuery(options) {
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
    putQuery(options) {
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
    deleteQuery(options) {
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
    perform(options) {
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
    find(options, criterias) {
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
    async _request(options) {
        const reqUrl = this._generateRelativeUrl(options.uri);
        const method = options.method;
        const timeout = this.timeout;
        const parseResponse = options.parseResponse;
        const extraHeaders = options.extraHeaders || {};
        //const self = this;
        const requestHeaders = headers(this, Object.assign({
            Accept: 'application/json',
            'X-Plex-Token': this.token,
        }, extraHeaders));
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
            return new Error('Plex Server denied request due to lack of managed user permissions ! ' +
                'In case of a delete request, delete content mustbe allowed in plex-media-server options.');
        }
        // 401 unauthorized when authentication is required against the requested URL
        if (response.status === 401) {
            return new Error('Plex Server denied request');
        }
        if (response.status < 200 || response.status > 299) {
            return new Error('Plex Server didnt respond with a valid 2xx status code, response code: ' + response.status);
        }
        // prevent holding an open http agent connection by pretending to consume data,
        // releasing socket back to the agent connection pool: http://nodejs.org/api/http.html#http_agent_maxsockets
        //response.on('data', function onData() {});
        const body = await response.text();
        return parseResponse ? this.ResponseParser(response, body) : undefined;
    }
    _serverScheme() {
        if (typeof this.https !== 'undefined') {
            // If https is supplied by the user, always do what it says
            return this.https ? 'https://' : 'http://';
        }
        // Otherwise, use https if it's on port 443, the standard https port.
        return this.port === "443" ? 'https://' : 'http://';
    }
    _generateRelativeUrl(relativeUrl) {
        return this._serverScheme() + this.serverUrl + relativeUrl;
    }
    ResponseParser(response, body) {
        if (response.headers.get('Content-Type') === 'application/json') {
            return Promise.resolve(body).then(JSON.parse);
        }
        else if (!response.headers.get('Content-Type') || response.headers.get('Content-Type').indexOf('xml') <= -1) {
            return Promise.resolve(body);
        }
        else {
            return xmlParser.parse(body);
        }
    }
}
function filterChildrenByCriterias(children, criterias) {
    const context = {
        criterias: criterias || {},
    };
    return children.filter(criteriasMatchChild, context);
}
function criteriasMatchChild(child) {
    const criterias = this.criterias;
    return Object.keys(criterias).reduce(function matchCriteria(hasFoundMatch, currentRule) {
        const regexToMatch = new RegExp(criterias[currentRule]);
        return regexToMatch.test(child[currentRule]);
    }, true);
}
//# sourceMappingURL=plexAPI.js.map