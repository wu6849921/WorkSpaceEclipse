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
    /**
     * @desc load resource file by user language.
     * @return resource file content under src/res/balance_sheet/blsheet_labels_%language%.json.
     */
    function loadResourceFile() {

        var name = 'blsheet_labels';
        var templatename = targetName(name) + '.json';
        var templateContents = getCache().get({
            key: targetName(name),
            loader: function() {
                return file.load({
                    path: 'src/res/balance_sheet/' + templatename
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
    /**
     * @desc get cache by name blsheet_labels.
     * @return cache.Cache.
     */
    function getCache() {
        return cache.getCache({
            name: 'blsheet_labels',
            scope: cache.Scope.PROTECTED
        });
    }

    return {
        loadResourceFile: loadResourceFile
    };
});
