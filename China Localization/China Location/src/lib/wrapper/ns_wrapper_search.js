/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    'N/search'
],
/**
 * @param {search} search
 */
function(search) {
    function global(obj) {
        return search.global(obj);
    }
    function create(obj) {
        return search.create(obj);
    }

    function createFilter(obj) {
        var filter = search.createFilter(obj);
        return filter;
    }

    function createColumn(obj) {
        var column = search.createColumn(obj);
        return column;
    }

    function load(obj) {
        return search.load(obj);
    }
    
    function lookupFields(obj) {
        return search.lookupFields(obj);
    }

    var wrapper = {
        global: global,
        create: create,
        createFilter: createFilter,
        createColumn: createColumn,
        load: load,
        lookupFields: lookupFields
    };

    Object.defineProperty(wrapper, 'Operator', {
        enumerable: true,
        get: function() {
            return search.Operator;
        }
    });

    Object.defineProperty(wrapper, 'Summary', {
        enumerable: true,
        get: function() {
            return search.Summary;
        }
    });
    
    Object.defineProperty(wrapper, 'Type', {
        enumerable: true,
        get: function() {
            return search.Type;
        }
    });

    Object.defineProperty(wrapper, 'Sort', {
        enumerable: true,
        get: function() {
            return search.Sort;
        }
    });

    return wrapper;

});
