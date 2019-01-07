/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @author Joe
 * @appliedtorecord OPP
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
		try {
			var currentRecord = context.currentRecord;
			var sublistName = context.sublistId;
			var sublistFieldName = context.fieldId;
			var numLines = currentRecord.getLineCount({
				sublistId : 'item'
			});

			if (sublistName === 'item' && sublistFieldName === 'item') {
				var itemId = currentRecord.getCurrentSublistValue({
					sublistId : 'item',
					fieldId : 'item'
				});
				if (itemId == '') {
					return true;
				}
				var FHCSearch = search.create({
					type : 'customrecord_tn_packinginfo',
					filters : [ [ 'custrecord_tn_parentrec', 'is', itemId ] ],
					columns : [ 'custrecord_tn_packingtype',
							'custrecord_tn_pack_size' ]
				});
				FHCSearch.run().each(function(result) {
					var packingType = result.getText({
						name : 'custrecord_tn_packingtype'
					});
					var packingSize = result.getValue({
						name : 'custrecord_tn_pack_size'
					});
					// alert(packingType + '|' + packingSize);
					if (packingType == 'Inner') {
						// alert(packingType + '|' + packingSize);
						currentRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_opp_packsize_inner',
							value : packingSize
						});
					}
					if (packingType == 'Master Carton') {
						// alert(packingType + '|' + packingSize);
						currentRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_opp_packsize_mastercarton',
							value : packingSize
						});
					}
					if (packingType == 'Loading') {
						// alert(packingType + '|' + packingSize);
						currentRecord.setCurrentSublistValue({
							sublistId : 'item',
							fieldId : 'custcol_tn_opp_loading_packsize',
							value : packingSize
						});
					}
					return true;
				});
				// alert('end');

				// …Ë÷√factory

				var itemRecord;
				var itemSearch = search.create({
					type : search.Type.ITEM,
					filters : [ [ 'internalid', 'is', itemId ] ]
				});
				itemSearch.run().each(function(result) {
					itemRecord = record.load({
						type : result.recordType,
						id : itemId
					});
					return true;
				});
				// try {
				// itemRecord = record.load({
				// type : record.Type.INVENTORY_ITEM,
				// id : itemId,
				// isDynamic : true,
				// });
				// } catch (e) {
				// itemRecord = record.load({
				// type : record.Type.ASSEMBLY_ITEM,
				// id : itemId,
				// isDynamic : true,
				// });
				// } finally {
				var numLines = itemRecord.getLineCount({
					sublistId : 'itemvendor'
				});
				var vendor;
				for (var i = 0; i < numLines; i++) {
					var preferred = itemRecord.getSublistValue({
						sublistId : 'itemvendor',
						fieldId : 'preferredvendor',
						line : i,
					});
					var vendorV = itemRecord.getSublistValue({
						sublistId : 'itemvendor',
						fieldId : 'vendor',
						line : i,
					});
					if (preferred) {
						vendor = vendorV;
					}
				}
				if (vendor) {
					currentRecord.setCurrentSublistValue({
						sublistId : 'item',
						fieldId : 'custcol_tn_opp_factory',
						value : vendor
					});
				}
				// }
			}
		} catch (e) {
			alert(e);
		}

	}
	return {
		fieldChanged : fieldChanged
	};
});