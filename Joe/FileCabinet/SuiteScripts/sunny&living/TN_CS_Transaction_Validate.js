/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define([ 'N/ui/dialog' ], function(dialog) {
	var tmpRate = 0;
	function saveRecord(context) {
		try {
			var currentRecord = context.currentRecord;
			var lineCount = currentRecord.getLineCount({
				sublistId : 'item'
			});

			for (var i = 0; i < lineCount; i++) {
				var packSize = currentRecord.getSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_pack_size',
					line : i
				});

				if (!util.isNumber(packSize)) {
					dialog.alert({
						title : 'Notice',
						message : 'Please enter pack size on item line '
								+ (i + 1)
					});
					return false;
				}

				var quantity = currentRecord.getSublistValue({
					sublistId : 'item',
					fieldId : 'quantity',
					line : i
				});
				if (!util.isNumber(quantity)) {
					dialog.alert({
						title : 'Notice',
						message : 'Please enter quantity on item line '
								+ (i + 1)
					});
					return false;
				}
			}

			return true;
		} catch (e) {
			return true;
		}
	}

	function fieldChanged(context) {
		try {
			var record = context.currentRecord;
			var sublistId = context.sublistId;
			var fieldId = context.fieldId;
			if (sublistId === 'item') {
				if (fieldId === 'quantity') {
					var quantity = record.getCurrentSublistValue({
						sublistId : sublistId,
						fieldId : 'quantity'
					});
					var packSize = record.getCurrentSublistValue({
						sublistId : sublistId,
						fieldId : 'custcol_tn_pack_size'
					});

					if (packSize) {
						var newCtnQty = (quantity * 100) / (packSize * 100);
						jQuery('#custcol_tn_carton_qty').val(newCtnQty);

						var volumn = record.getCurrentSublistValue({
							sublistId : sublistId,
							fieldId : 'custcol_tn_vol'
						}) || 0;
						record.setCurrentSublistValue({
							sublistId : sublistId,
							fieldId : 'custcol_tn_tol_vol',
							value : volumn * newCtnQty
						});
					}

				}

				// rate为空不能使用该item add by 20180927
				// if (fieldId === 'custcol_tn_item_name'
				// && record.type != 'purchaseorder') {
				// var rate = record.getCurrentSublistValue({
				// sublistId : sublistId,
				// fieldId : 'rate'
				// });
				// // alert(rate);
				// tmpRate = rate ? rate : 0;
				// if (!rate) {
				// alert('该item没有维护价格，请不要使用！');
				// }
				// }
				// rate为空不能使用该item add by 20180927
				if (fieldId === 'custcol_tn_item_name'
						&& record.type != 'purchaseorder') {
					var rate = record.getCurrentSublistValue({
						sublistId : sublistId,
						fieldId : 'rate'
					});
					// alert(rate);
					tmpRate = rate ? rate : -1;
					// if (!rate) {
					// alert('该item没有维护价格，请不要使用！如果该item已经维护价格，请忽略这个提示！');
					// }
				}

			}
		} catch (ex) {
			if (typeof console != 'undefined')
				console.log('set line item error', ex);
		}
	}
	/**
	 * Validation function to be executed when sublist line is committed.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
	 * 
	 * @returns {boolean} Return true if sublist line is valid
	 * 
	 * @since 2015.2
	 */
	function validateLine(context) {
		var record = context.currentRecord;
		var sublistId = context.sublistId;
		if (sublistId === 'item' && record.type != 'purchaseorder') {
			// rate为空不能使用该item add by 20180927
			// alert(tmpRate);
			if (tmpRate == -1) {
				alert('该item没有维护价格，请不要使用！');
				return false;
			}
		}
		return true;
	}
	return {
		saveRecord : saveRecord,
		fieldChanged : fieldChanged,
		validateLine : validateLine
	}
});
