/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define([
    '../../lib/wrapper/ns_wrapper_runtime',
    '../../lib/commons'
],

/*
 * This file is for client caller script, note 'log' doesn't work here! For server-side script caller script, use commonrresource.js.
 */
function(runtime, commons) {

    var strings = {
        errors: {
            zh_CN: {
                Alert: '\u63d0\u793a',
                Error: '\u9519\u8bef\u000d\u000a',
                UnexpectedError: '\u53d1\u751f\u610f\u5916\u7684\u9519\u8bef\u3002'
            },
            en_US: {
                Alert: 'Alert',
                Error: 'Error',
                UnexpectedError: 'An Unexpected Error has Occurred.'
            }
        },
        labels: {
            zh_CN: {
                ConfirmButton: '\u786e\u5b9a',
                CancelButton: '\u53d6\u6d88'
            },
            en_US: {
                ConfirmButton: 'OK',
                CancelButton: 'Cancel'
            }
        }
    };

    var names = {
        Errors: 'Errors',
        Labels: 'Labels'
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
