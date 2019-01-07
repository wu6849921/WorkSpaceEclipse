/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @Nauthor Trigger Joe
 * @Nversion 1.0
 */
define([], function() {
	/**
	 * Function definition to be triggered before record is loaded.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.newRecord - New record
	 * @param {Record}
	 *            scriptContext.oldRecord - Old record
	 * @param {string}
	 *            scriptContext.type - Trigger type
	 * @Since 2015.2
	 */
	function beforeSubmit(scriptContext) {
		try {
			if (scriptContext.type == scriptContext.UserEventType.COPY
					|| scriptContext.UserEventType.CREATE
					|| scriptContext.UserEventType.EDIT) {
				var newRecord = scriptContext.newRecord;
				var numLines = newRecord.getLineCount({
					sublistId : 'item'
				});
				for (var i = 0; i < numLines; i++) {
					var rate = newRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'rate',
						line : i
					});
					var taxrate = newRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'taxrate1',
						line : i
					});
					if (rate && taxrate) {
						newRecord.setSublistValue({
							sublistId : 'item',
							fieldId : 'custcol2',
							value : rate * (1 + taxrate / 100),
							line : i
						});

					}
				}

			}
		} catch (e) {
			log.debug({
				title : 'beforeSubmit',
				details : e
			});
		}
	}
	return {
		beforeSubmit : beforeSubmit
	};
});