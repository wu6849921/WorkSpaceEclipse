/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    'N/url'
],
/**
 * @param {url} url
 */
function(url) {

    function resolveScript(options) {
        return url.resolveScript(options);
    }

    function resolveTaskLink(id, options) {
        return url.resolveTaskLink(id, options);
    }

    function resolveDomain(options) {
        return url.resolveDomain({
            hostType: options.hostType,
            accountId: options.accountId
        });
    }

    function format(options) {
        return url.format(options);
    }

    var wrapper = {
        resolveScript: resolveScript,
        resolveTaskLink: resolveTaskLink,
        resolveDomain: resolveDomain,
        format: format
    };

    Object.defineProperty(wrapper, 'HostType', {
        enumerable: true,
        get: function() {
            return url.HostType;
        }
    });

    return wrapper;

});
