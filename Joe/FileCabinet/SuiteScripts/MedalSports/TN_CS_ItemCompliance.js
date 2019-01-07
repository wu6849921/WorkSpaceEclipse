/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @author Joe
 * @appliedtorecord pl so iv
 */
define([ 'N/record', 'N/search', 'N/currency' ], function(record, search,
		currency) {
	/**
	 * Function to be executed when field is changed.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
	 * @param {string}
	 *            scriptContext.fieldId - Field name
	 * @param {number}
	 *            scriptContext.lineNum - Line number. Will be undefined if not
	 *            a sublist or matrix field
	 * 
	 * @since 2015.2
	 */
	function fieldChanged(context) {
		try {
			var currentRecord = context.currentRecord;
			var sublistFieldName = context.fieldId;
			// entity变化监听事件 20180516
			if (sublistFieldName == 'custrecord_tn_ic_item'
					|| sublistFieldName == 'custrecord_tn_item_compliance_so'
					|| sublistFieldName == 'custrecord_tn_item_compliance_po') {
				var itemNum = currentRecord.getValue({
					fieldId : 'custrecord_tn_ic_item'
				});
				var soNum = currentRecord.getValue({
					fieldId : 'custrecord_tn_item_compliance_so'
				});
				var poNum = currentRecord.getValue({
					fieldId : 'custrecord_tn_item_compliance_po'
				});
				if (!itemNum || !soNum || !poNum) {
					return;
				}
				var soRecord = record.load({
					type : record.Type.SALES_ORDER,
					id : soNum
				});
				var numLines = soRecord.getLineCount({
					sublistId : 'item'
				});
				var factor;
				var shipDates = [];
				for (var i = 0; i < numLines; i++) {
					var soItem = soRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'item',
						line : i
					});
					var soPoNum = soRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'custcol_tn_line_customerpo',
						line : i
					});
					var earlyShipDate = soRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'custcol_tn_po_esd',
						line : i
					});
					var vendorName = soRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'custcol_tn_quote_vendorshortname',
						line : i
					});
					if (soItem == itemNum && soPoNum == poNum) {
						factor = vendorName;
						if (shipDates.indexOf(earlyShipDate) == -1) {
							shipDates.push(earlyShipDate);
						}
					}
				}
				var shipDatesN = sortarr(shipDates);
				var earlyShipDate = shipDatesN[0];
				if (earlyShipDate) {
					currentRecord.setValue({
						fieldId : 'custrecord_tn_item_compliance_shipdate',
						value : earlyShipDate
					});
				}
				if (factor) {
					currentRecord.setValue({
						fieldId : 'custrecord_tn_item_compliance_factory',
						value : factor
					});
				}
			}

		} catch (e) {
			alert(e);
		}

	}
	function sortarr(arr) {
		for (i = 0; i < arr.length - 1; i++) {
			for (j = 0; j < arr.length - 1 - i; j++) {
				if (arr[j] > arr[j + 1]) {
					var temp = arr[j];
					arr[j] = arr[j + 1];
					arr[j + 1] = temp;
				}
			}
		}
		return arr;
	}
	return {
		fieldChanged : fieldChanged
	};
});