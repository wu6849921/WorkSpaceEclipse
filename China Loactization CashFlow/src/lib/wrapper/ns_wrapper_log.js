/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([ '../commons' ], function(commons) {

	var sourceType = {
		client : 'client',
		server : 'server'
	};

	function debug(title, details, source) {
		if (!commons.makesure(source) || source !== sourceType.client) {
			log.debug({
				title : title,
				details : details
			});
		}
	}

	return {
		debug : debug,
		sourceType : sourceType
	};

});
