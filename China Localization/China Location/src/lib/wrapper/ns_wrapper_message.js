/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    './ns_wrapper_require'
],

function(require) {

    var message;
    
    function requireMessage(){
        if(message === undefined){
            message = require.requireModule('N/ui/message');
        }
        return message;
    }
    
    function create(options) {
        return requireMessage().create(options);
    }



    var wrapper = {
        create: create

    };

    Object.defineProperty(wrapper, 'Type', {
        enumerable: true,
        get: function() {
             return requireMessage().Type;

        }
    });

    return wrapper;
});
