/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    'N/encode'
],
/**
 * @param {encode} encode
 */
function(encode) {
	function convert(params){
		return encode.convert(params);
	}

    var wrapper = {
        convert: convert
    };

    Object.defineProperty(wrapper, 'Encoding', {
        enumerable: true,
        get: function() {
            return encode.Encoding;
        }
    });
   
    return wrapper;

});
