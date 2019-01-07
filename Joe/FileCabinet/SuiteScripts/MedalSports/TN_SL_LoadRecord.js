/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define([ 'N/record' ], function(record) {
	function onRequest(context) {
		var request = context.request;
		var response = context.response;
		var parameters = request.parameters;
		if (context.request.method === 'GET') {
			log.debug({
				title : 'parameters',
				details : parameters
			});
			var recordType = parameters.custparam_recordtype;
			var recordId = parameters.custparam_recordid;
			var itemId = parameters.custparam_itemid;
			var soRec = record.load({
				type : recordType,
				id : recordId
			});
			var lineNum = soRec.getLineCount({
				sublistId : 'item'
			});
			// alert(itemId);
			var createdfrom = '-1';
			for (var i = 0; i < lineNum; i++) {
				var itemIdSo = soRec.getSublistValue({
					sublistId : 'item',
					fieldId : 'item',
					line : i
				});
				var poNum = soRec.getSublistValue({
					sublistId : 'item',
					fieldId : 'createdpo',
					line : i
				});
				// alert(itemIdSo);
				if (itemIdSo == itemId) {
					createdfrom = poNum ? poNum : '-1';
					// alert(createdfrom);
					break;
				}
			}
			log.debug({
				title : 'createdfrom',
				details : createdfrom
			});
			response.write(createdfrom);
		}
	}
	return {
		onRequest : onRequest
	};
});