/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([],

function() {
	/**
	 * Function definition to be triggered before record is loaded.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.newRecord - New record
	 * @param {string}
	 *            scriptContext.type - Trigger type
	 * @param {Form}
	 *            scriptContext.form - Current form
	 * @Since 2015.2
	 */
	function beforeSubmit(context) {
		var newRecord = context.newRecord;
		if (context.type == context.UserEventType.CREATE
				|| context.type == context.UserEventType.EDIT) {
			var area = newRecord.getValue({
				fieldId : 'custbody_cseg_tn_area'
			});
			if (area) {
				var numLines = newRecord.getLineCount({
					sublistId : 'item'
				});
				for (var i = 0; i < numLines; i++) {
					var areaL = newRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'custcol_cseg_tn_area',
						line : i
					});
					if (!areaL) {
						// log.debug({
						// title : 'area',
						// details : area
						// });
						newRecord.setSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_cseg_tn_area',
							line : i,
							value : area
						});
					}
				}
			}
		}
	}

	return {
		beforeSubmit : beforeSubmit
	};

});
