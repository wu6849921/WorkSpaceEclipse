/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define([
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../lib/commons'
],

/*
 * This file is for client caller script, note 'log' doesn't work here! For server-side script caller script, use prefresource.js.
 */
function(runtime, commons) {

    var strings = {
        errors: {
            zh_CN: {
                Alert: '\u63d0\u793a',
                Error: '\u9519\u8bef\u000d\u000a'                
            },
            en_US: {
                Alert: 'Alert',
                Error: 'Error'
            }
        },
        informations: {
            zh_CN: {
                Loading: '\u6570\u636e\u52a0\u8f7d\u4e2d...'
            },
            en_US: {
                Loading: 'Loading...'
            }
        }
    };

    var names = {
        Errors: 'Errors',
        Informations: 'Informations'
    };

    function language() {
        if (runtime.getUserLanguage() === 'zh_CN') {
            return 'zh_CN';
        } else {
            return 'en_US';
        }
    }

    function load(params) {
        if (!commons.makesure(params)) {
            return;
        }

        var name = commons.isPrimitive(params) ? params : params.name;
        var key = commons.isPrimitive(params) ? null : params.key;
        var defaultValue = commons.isPrimitive(params) ? null : params.defaultValue;

        var jsonObject = strings[name.toLowerCase()][language()];

        if (commons.makesure(key)) {
            if (commons.makesureall(jsonObject, key)) {
                return jsonObject[key];
            } else {
                return defaultValue;
            }
        }
        return jsonObject;
    }

    var resource = {
        load: load
    };

    Object.defineProperty(resource, 'Name', {
        enumerable: true,
        get: function() {
            return names;
        }
    });

    return resource;

});
