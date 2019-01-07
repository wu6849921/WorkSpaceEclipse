/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define([
        '../../lib/wrapper/ns_wrapper_file',
        '../../lib/wrapper/ns_wrapper_cache',
        '../../lib/wrapper/ns_wrapper_runtime',
        '../../lib/commons'
    ],

    function(file, cache, runtime, commons){

        var names = {
            Labels: 'Labels',
            File: 'File'
        };

        function getCache(){
            return cache.getCache({
                name: cache.Name.Pref,
                scope:cache.Scope.PROTECTED
            })
        }

        function targetName(name) {
            if (runtime.getUserLanguage() === 'zh_CN') {
                return name + '_zh_CN';
            } else {
                return name + '_en_US';
            }
        }

        function load(params){
            log.debug('prefresource.js: params',params);
            if(!commons.makesure(params)){
                return;
            }

            var name = commons.isPrimitive(params)? params: params.name;
            var key  = commons.isPrimitive(params)? null: params.key;
            var defaultValue = commons.isPrimitive(params)? null: params.defaultValue;
            var replacements = commons.isPrimitive(params)? null: params.replacements;

            var contents;
            refresh(name);
            if(commons.makesure(params.language)){
                contents = getCache.get({
                    key: name + '_' + params.language,
                    loader: function() {
                        return file.load({
                            path: 'src/res/pref/pref_' + name.toLowerCase() + '_' + params.language + '.json'
                        }).getContents();
                    },
                    ttl: 1 * 60 * 60
                })
            }else {
                contents = getCache().get({
                    key: targetName(name),
                    loader: function () {
                        return file.load({
                            path: 'src/res/pref/pref_' + targetName(name.toLowerCase()) + '.json'
                        }).getContents();
                    },
                    ttl: 1 * 60 * 60
                });
            }
            var jsonObject=JSON.parse(contents);
            if (name === names.Labels && !runtime.isOW()) {
                jsonObject.Subsidiary = jsonObject.Company;
            }
            if (commons.makesure(key)) {
                if (commons.makesureall(jsonObject, key)) {
                    log.debug('prefresource.js: value of key', jsonObject[key]);
                    var revisedValue = jsonObject[key];
                    for(var p in replacements) {
                        revisedValue = commons.replace(revisedValue, p, replacements[p]);
                    }
                    return revisedValue;
                } else {
                    log.audit('prefresource.js: value of key', 'Unable to locate key, default value ' + defaultValue + ' returned.');
                    return defaultValue;
                }
            }
            return jsonObject;
        }

        function refresh(name) {
            getCache().remove({
                key: targetName(name)
            });
        }

        var resource ={
            load: load,
            refresh: refresh
        }

        Object.defineProperty(resource,'Name',{
            enumerable: true,
            get:function () {
                return names ;
            }
        })

        return resource

    })