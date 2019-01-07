/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    'N/https'
],
/**
 * @param {https} https
 */
function(https) {
    function get(options) {
        return https.get(options);
    }
    function post(options) {
        return https.post(options);
    }
    return {
        post: post,
        get: get
    };

});
