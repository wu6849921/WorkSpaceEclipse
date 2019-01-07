/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([],

function() {

    function requireModule(dependencies, callback) {
        return require(dependencies, callback);
    }

    var wrapper = {
        requireModule: requireModule
    };

    return wrapper;

});
