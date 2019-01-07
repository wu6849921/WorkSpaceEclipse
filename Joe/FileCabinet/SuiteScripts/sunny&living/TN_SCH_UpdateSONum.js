/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */
define([ 'N/record', 'N/search' ], function(record, search) {

	/**
	 * Definition of the Scheduled script trigger point.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {string}
	 *            scriptContext.type - The context in which the script is
	 *            executed. It is one of the values from the
	 *            scriptContext.InvocationType enum.
	 * @Since 2015.2
	 */
	function execute(scriptContext) {
		// if (scriptContext.type == scriptContext.InvocationType.ON_DEMAND) {
		try {
			log.debug({
				title : 'execute',
				details : 'start!'
			});
			var SOSearch = search.create({
				type : search.Type.SALES_ORDER,
				filters : [ [ 'mainline', 'is', 'T' ] ],
				columns : [ 'internalid', 'custbody_customer_so_no', 'tranid' ]
			});
			var searchResult = SOSearch.run().getRange({
				start : 0,
				end : 1000
			})

			for (var i = 0; i < searchResult.length; i++) {
				var recordId = searchResult[i].id;
				var tranid = searchResult[i].getValue({
					name : 'tranid'
				});
				log.debug({
					title : 'tranid+id',
					details : tranid + '|' + recordId
				});
				if (recordId == '26595' || recordId == '26594') {
					var SORec = record.load({
						type : record.Type.SALES_ORDER,
						id : recordId
					});
					var customerSoNo = SORec.getValue({
						fieldId : 'custbody_customer_so_no',
					});
					log.debug({
						title : 'customerSoNo',
						details : customerSoNo
					});
					SORec.setValue({
						fieldId : 'custbody_customer_so_no',
						value : '0' + customerSoNo
					});
					SORec.save({
						ignoreMandatoryFields : true
					});
				}
			}

			// var searchResult2 = SOSearch.run().getRange({
			// start : 1000,
			// end : 2000
			// })
			// for (var i = 0; i < searchResult2.length; i++) {
			// var recordId = searchResult2[i].id;
			// log.debug({
			// title : 'recordId',
			// details : recordId
			// });
			// if (recordId == '26595' || recordId == '26594') {
			// var SORec = record.load({
			// type : record.Type.SALES_ORDER,
			// id : recordId
			// });
			// var customerSoNo = SORec.getValue({
			// fieldId : 'custbody_customer_so_no',
			// });
			// log.debug({
			// title : 'customerSoNo',
			// details : customerSoNo
			// });
			// SORec.setValue({
			// fieldId : 'custbody_customer_so_no',
			// value : '0' + customerSoNo
			// });
			// SORec.save({
			// ignoreMandatoryFields : true
			// });
			// }
			// }
		} catch (e) {
			log.debug({
				title : 'execute error',
				details : e
			});
		}

		// SORecords.run().each(function(result) {

		// });
		// }

	}

	return {
		execute : execute
	};

});
