/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @Nauthor Trigger Joe
 * @Nversion 1.0 20180319
 */
define([ 'N/search', 'N/record', 'N/https', 'N/url' ], function(search, record,
		https, url) {

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
		if (createdfromT.indexOf('Purchase Order') == -1
				&& createdfromT.indexOf('Sales Order') == -1) {
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
				fieldId : 'custcol_tn_uniqueid',
				line : i
			});
			var itemId = currentRecord.getSublistValue({
				sublistId : 'item',
				fieldId : 'item',
				line : i
			});
			// itemLine++;// item receipt��line��po��line��ƥ�䣬��ֹΪ�Σ��ȼ���һ by
			// 1011
			// alert(itemLine);
			if (itemReceive) {
				var status = _validateLine(currentRecord, search, itemLine,
						itemId);
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
			alert(itemKey + '�؛δͨ�^���o����؛����؛��');
			return false;
		}
	}
	function _validateLine(currentRecord, search, itemLine, itemId) {
		var createdfrom = currentRecord.getValue({
			fieldId : 'createdfrom'
		});
		var createdfromType = currentRecord.getText({
			fieldId : 'createdfrom'
		});
		var status = '2';// ��ʼ��ͨ��
		// alert(status);
		// filters : [
		// [ 'custrecord_tn_po', 'is', createdfrom ],
		// 'AND',
		// [ 'custrecord_tn_po_inspection_itemnum',
		// 'is', item ] ],
		// ˵���ǹ�Ӧ��ֱ�ӷ���
		if (createdfromType.indexOf('Sales Order') != -1) {
			// var urlRec =
			// 'https://system.netsuite.com/app/site/hosting/scriptlet.nl?script=82&deploy=1&custparam_recordtype=salesorder&custparam_recordid='
			// + createdfrom + '&custparam_itemid=' + itemId;
			var urlRec = url.resolveScript({
				scriptId : 'customscript_loadrecord',
				deploymentId : 'customdeploy_loadrecord',
				params : {
					custparam_recordtype : 'salesorder',
					custparam_recordid : createdfrom,
					custparam_itemid : itemId
				}
			});
			var response = https.get({
				url : urlRec
			});
			createdfrom = response.body;
		}
		// alert(createdfrom);
		if (createdfrom == '-1') {
			return '2';
		}
		// alert(createdfrom);
		// alert(itemLine);
		search.create(
				{
					type : 'customrecord_tn_inspection',
					filters : [
							[ 'custrecord_tn_po', 'is', createdfrom ],
							'AND',
							[ 'custrecord_tn_itemline', 'is', itemLine ],
							'AND',
							[ 'custrecord_tn_po_inspection_inspectionty', 'is',
									'7' ] ],
					columns : [ 'custrecord_tn_po_inspection_status' ]
				}).run().each(function(result) {
			status = result.getValue({
				name : 'custrecord_tn_po_inspection_status'
			});
			// alert(status);
			// alert(result.id);
			return true;
		});
		return status;
	}
	return {
		saveRecord : saveRecord
	};
});