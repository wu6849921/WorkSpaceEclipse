/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @Nauthor Trigger Joe
 * @Nversion 1.0 20180319
 */
define(
		[ 'N/search', 'N/record', 'N/https' ],
		function(search, record, https) {

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
						fieldId : 'line',
						line : i
					});
					// var createdpo = currentRecord.getSublistValue({
					// sublistId : 'item',
					// fieldId : 'createdpo',
					// line : i
					// });
					// itemLine++;// item receipt的line和po的line不匹配，不止为何，先加上一 by
					// 1011
					// alert(itemLine);
					// alert(createdpo);
					if (itemReceive) {
						var status = _validateLine(currentRecord, search,
								itemLine);
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
					return false;
				}
			}
			function _validateLine(currentRecord, search, item) {
				var createdfrom = currentRecord.getValue({
					fieldId : 'createdfrom'
				});
				var createdfromType = currentRecord.getText({
					fieldId : 'createdfrom'
				});
				var itemId = currentRecord.getSublistValue({
					sublistId : 'item',
					fieldId : 'item',
					line : 0
				});
				var status = '2';// 初始化通过
				// alert(status);
				// filters : [
				// [ 'custrecord_tn_po', 'is', createdfrom ],
				// 'AND',
				// [ 'custrecord_tn_po_inspection_itemnum',
				// 'is', item ] ],
				// 说明是供应商直接发运
				if (createdfromType.indexOf('Sales Order') != -1) {
					var urlRec = 'https://system.na2.netsuite.com/app/site/hosting/scriptlet.nl?script=61&deploy=1&custparam_recordtype=salesorder&custparam_recordid='
							+ createdfrom + '&custparam_itemid=' + itemId;
					// console.log(urlRec);
					var response = https.get({
						url : urlRec
					});
					// https://system.na2.netsuite.com/app/site/hosting/scriptlet.nl?script=61&deploy=1&custparam_recordtype=salesorder&custparam_recordid=1755&custparam_itemid=727
					createdfrom = response.body;
				}
				// alert(createdfrom);
				if (createdfrom == '-1') {
					return '2';
				}
				// alert(createdfrom);
				// alert(item);
				search
						.create(
								{
									type : 'customrecord_tn_inspection',
									filters : [
											[ 'custrecord_tn_po', 'is',
													createdfrom ],
											'AND',
											[ 'custrecord_tn_itemline', 'is',
													item ],
											'AND',
											[
													'custrecord_tn_po_inspection_inspectionty',
													'is', '7' ] ],
									columns : [ 'custrecord_tn_po_inspection_status' ]
								}).run().each(function(result) {
							status = result.getValue({
								name : 'custrecord_tn_po_inspection_status'
							});
							// alert(status);
							return true;
						});
				return status;
			}
			return {
				saveRecord : saveRecord
			};
		});