/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([],
/**
 * @param {currentRecord} currentRecord
 */
function() {
	
	function get(){
	    var currentRecord = require('N/currentRecord');
		var record=currentRecord.get();

		return record;
	}
   
    return {
        get : get
    };
    
});
