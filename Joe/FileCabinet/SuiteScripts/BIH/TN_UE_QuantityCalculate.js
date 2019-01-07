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
					var quantity;
					// var purchasePeriod = newRecord.getValue({// 采购期限
					// fieldId : 'custbody_purordpurchaseperiod'
					// });
					var purchasePeriod = newRecord.getText({// 采购期限
						fieldId : 'custbody_purordpurchaseperiod'
					});
					purchasePeriod = purchasePeriod.substring(0,
							purchasePeriod.length - 2);
					var purchaseQuantity = newRecord.getSublistValue({// 采购数量
						sublistId : 'item',
						fieldId : 'custcol_purordpurchasequantity',
						line : i
					});
					if (purchaseQuantity != '' && purchasePeriod != '') {
						quantity = purchaseQuantity * purchasePeriod;
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