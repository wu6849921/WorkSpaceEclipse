/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @Nauthor Trigger Joe
 * @Nversion 1.0 20180319
 */
define([ 'N/search' ], function(search) {

	/**
	 * Function to be executed after line is selected.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
	 * 
	 * @since 2015.2
	 */
	function saveRecord(context) {
		var currentRecord = context.currentRecord;
		var lineNum = currentRecord.getLineCount({
			sublistId : 'item'
		});
		var isPass = true;
		var itemKey;
		var createdfromT = currentRecord.getText({
			fieldId : 'createdfrom'
		});
		if (createdfromT.indexOf('Transfer') != -1) {
			return true;
		}
		for (var i = 0; i < lineNum; i++) {
			var itemReceive = currentRecord.getSublistValue({
				sublistId : 'item',
				fieldId : 'itemreceive',
				line : i
			});
			// var item = currentRecord.getSublistValue({
			// sublistId : 'item',
			// fieldId : 'item',
			// line : i
			// });
			var itemName = currentRecord.getSublistValue({
				sublistId : 'item',
				fieldId : 'itemname',
				line : i
			});
			var itemLine = currentRecord.getSublistValue({
				sublistId : 'item',
				fieldId : 'line',
				line : i
			});
			// alert(itemLine);
			if (itemReceive) {
				var status = _validateLine(currentRecord, search, itemLine);
				if (status != '2' && status != '6' && status != '8'
						&& status != '7') {
					isPass = false;
					itemKey = itemName + '(' + itemLine + ')';
					break;
				}
			}
		}
		if (isPass) {
			return true;
		} else {
			alert(itemKey + '驗貨未通過！無法收貨或退貨！');
		}
	}
	function _validateLine(currentRecord, search, item) {
		var createdfrom = currentRecord.getValue({
			fieldId : 'createdfrom'
		});
		var createdfromType = currentRecord.getValue({
			fieldId : 'createdfrom'
		});

		var status;
		// alert(status);
		// filters : [
		// [ 'custrecord_tn_po', 'is', createdfrom ],
		// 'AND',
		// [ 'custrecord_tn_po_inspection_itemnum',
		// 'is', item ] ],
		if (condition) {
			
		}
		search.create(
				{
					type : 'customrecord_tn_inspection',
					filters : [
							[ 'custrecord_tn_po', 'is', createdfrom ],
							'AND',
							[ 'custrecord_tn_itemline', 'is', item ],
							'AND',
							[ 'custrecord_tn_po_inspection_inspectionty', 'is',
									'7' ] ],
					columns : [ 'custrecord_tn_po_inspection_status' ]
				}).run().each(function(result) {
			status = result.getValue({
				name : 'custrecord_tn_po_inspection_status'
			});
			return true;
		});
		return status;
	}
	return {
		saveRecord : saveRecord
	};
});