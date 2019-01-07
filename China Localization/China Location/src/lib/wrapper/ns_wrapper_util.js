/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */

define([
    'N/util'
],
/**
 * @param {util} util
 */
function(util) {

    function extend(receiver, contributor) {
        return util.extend(receiver, contributor);
    }

    return {
        extend: extend
    };

});
