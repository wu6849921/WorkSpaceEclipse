/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @Nauthor Trigger Joe
 * @Nversion 1.0 20180319
 */
define([ 'N/record', 'N/search' ], function(record, search) {
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
	 * @param {number}
	 *            scriptContext.columnNum - Line number. Will be undefined if
	 *            not a matrix field
	 * 
	 * @since 2015.2
	 */
	function fieldChanged(context) {
		var currentRecord = context.currentRecord;
		var sublistName = context.sublistId;
		var sublistFieldName = context.fieldId;
		var numLines = currentRecord.getLineCount({
			sublistId : 'item'
		});

		// Estimate 上FOB cost test20180319 取item上关联的record
		if (sublistName === 'item' && sublistFieldName === 'item') {
			var itemId = currentRecord.getCurrentSublistValue({
				sublistId : 'item',
				fieldId : 'item'
			});
			if (itemId == '') {
				return true;
			}
//			alert(itemId);
			var FHCSearch = search.create({
				type : 'customrecord_tn_factoryhistorycost',
				filters : [ [ 'custrecord_tn_item_fobitem', 'is', itemId ] ],
				columns : [ 'custrecord_tn_item_factory' ]
			});
			FHCSearch.run().each(function(result) {
                var factoryCost = result.getValue({
                    name: 'custrecord_tn_item_factory'
                });
//                alert(factoryCost);
                currentRecord.setCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'custcol2',
					value : factoryCost
				});
                return true;
            });
		}

	}
	return {
		fieldChanged : fieldChanged
	};
});