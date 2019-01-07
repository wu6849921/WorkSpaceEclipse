/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([
    'N/email'
],
/**
 * @param {email} email
 */
function(email) {
	function send(options){
		email.send(options);
	}
   
    return {
    	send: send
    };

});
