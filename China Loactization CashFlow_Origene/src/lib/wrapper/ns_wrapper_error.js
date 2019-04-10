/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    'N/error',
    '../../res/voucherresource-client'
],
/**
 * @param {error} error
 */
function(error, resource) {

    var messages = resource.load(resource.Name.Errors);

    function create(options) {
        return error.create(options);
    }

    function parseErrorResponse(response) {
        var errorCodeMessage = response.split('\n');
        var errorCodeMessageObj = {};
        errorCodeMessageObj.errorCode = errorCodeMessage[0].split(':')[1].trim();
        errorCodeMessageObj.message = errorCodeMessage[1].split(':')[1].trim();
        return errorCodeMessageObj;
    }

    var wrapper = {
        create: create,
        parseErrorResponse: parseErrorResponse,
        UserError: 'UserError',
        UnexpectedError: 'UnexpectedError'
    };

    Object.defineProperty(wrapper, 'Message', {
        enumerable: true,
        get: function() {
            return messages;
        }
    });

    return wrapper;
});
