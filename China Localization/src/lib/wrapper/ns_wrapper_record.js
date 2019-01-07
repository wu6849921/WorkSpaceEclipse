/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    'N/record'
],
/**
 * @param {record} record
 */
function(record) {

    function create(params) {
        return record.create(params);
    }

    function remove(params) {
        return record.delete(params);
    }

    function load(params) {
        return record.load(params);
    }
    
    function copy(params) {
        return record.copy(params);
    }

    function submitFields(params) {
        return record.submitFields(params);
    }

    var wrapper = {
        load: load,
        create: create,
        remove: remove,
        copy: copy,
        submitFields: submitFields
    };

    Object.defineProperty(wrapper, 'Type', {
        enumerable: true,
        get: function() {
            return record.Type;
        }
    });

    return wrapper;

});
