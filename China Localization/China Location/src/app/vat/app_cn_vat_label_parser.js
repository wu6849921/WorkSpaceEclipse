/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
    '../../lib/wrapper/ns_wrapper_file',
    '../../lib/wrapper/ns_wrapper_cache',
    '../../lib/wrapper/ns_wrapper_runtime'
],

function(file, cache, runtime) {
    function loadResourceFile() {
        var name = 'vat_labels';
        var templatename = targetName(name) + '.json';

        var templateContents = getCache().get({
            key: targetName(name),
            loader: function() {
                return file.load({
                    path: 'src/res/vat/' + templatename
                }).getContents();
            }
        });

        return JSON.parse(templateContents);
    }

    function targetName(name) {
        if (runtime.getUserLanguage() === 'zh_CN') {
            return name + '_zh_CN';
        } else {
            return name + '_en_US';
        }
    }

    function getCache() {
        return cache.getCache({
            name: 'vat',
            scope: cache.Scope.PROTECTED
        });
    }
    function refreshResourceFile() {
        var name = 'vat_labels';
        getCache().remove({
            key: targetName(name)
        });
    }

    return {
        loadResourceFile: loadResourceFile,
        refreshResourceFile: refreshResourceFile
    };
});
