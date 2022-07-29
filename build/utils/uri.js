let uriResolvers = {
    "directory": function directory(parentUrl, dir) {
        addDirectoryUriProperty(parentUrl, dir);
    },
    "server": function server(parentUrl, srv) {
        addServerUriProperty(srv);
    },
};
function addServerUriProperty(server) {
    server.uri = '/system/players/' + server.address;
}
function addDirectoryUriProperty(parentUrl, directory) {
    if (parentUrl[parentUrl.length - 1] !== '/') {
        parentUrl += '/';
    }
    if (directory.key[0] === '/') {
        parentUrl = '';
    }
    directory.uri = parentUrl + directory.key;
}
export function attach(parentUrl) {
    return function resolveAndAttachUris(result) {
        let children = result._children || [];
        children.forEach(function (child) {
            let childType = child._elementType.toLowerCase();
            let resolver = uriResolvers[childType];
            if (resolver) {
                resolver(parentUrl, child);
            }
        });
        return result;
    };
}
;
//# sourceMappingURL=uri.js.map