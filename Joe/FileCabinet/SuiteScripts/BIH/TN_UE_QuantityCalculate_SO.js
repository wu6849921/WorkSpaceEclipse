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
					var quantity =0;
					// var servicePeriod = newRecord.getValue({// 服务期限
					// fieldId : 'custbody_soproductserviceperiod'
					// });
					var servicePeriod = newRecord.getText({// 服务期限
						fieldId : 'custbody_soproductserviceperiod'
					});
					servicePeriod = servicePeriod.substring(0,
							servicePeriod.length - 2);
					var buyQuantity = newRecord.getSublistValue({// 购买数量
						sublistId : 'item',
						fieldId : 'custcol_xsdd_gmsl',
						line : i
					});
					if (buyQuantity != '' && servicePeriod != '') {
						quantity = buyQuantity * servicePeriod;
						newRecord.setSublistValue({// Quantity
							sublistId : 'item',
							fieldId : 'quantity',
							line : i,
							value : quantity
						});
					}
						
				}

			}
		} catch (e) {
			log.debug({
				title : 'add po button error',
				details : e
			});
		}
	}
	return {
		beforeSubmit : beforeSubmit
	};
});