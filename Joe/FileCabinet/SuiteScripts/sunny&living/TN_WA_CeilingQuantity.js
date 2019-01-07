/**
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 * @NModuleScope SameAccount
 */
define([ 'N/record', 'N/search' ], function(record, search) {

	function onAction(context) {
		log.debug({
			title : 'onAction start'
		});
		var newRecord = context.newRecord;
		var poIds = [];

		try {

			var lineCount = newRecord.getLineCount({
				sublistId : 'item'
			});
			for (var i = 0; i < lineCount; i++) {
				var poId = newRecord.getSublistValue({
					sublistId : 'item',
					fieldId : 'poid',
					line : i
				});

				if (poId && poIds.indexOf(poId) == -1) {
					poIds.push(poId);
				}
			}
			calculate(newRecord);

			newRecord.save({
				ignoreMandatoryFields : true
			});

			poIds.forEach(function(poId) {
				var poRec = record.load({
					type : record.Type.PURCHASE_ORDER,
					id : poId
				});
				calculate(poRec);
				poRec.save({
					ignoreMandatoryFields : true
				});
			});
		} catch (e) {
			log.debug({
				title : 'set WO/PO carton qty error',
				details : e
			});
		}

	}
	function calculate(newRecord) {
		var lineCount = newRecord.getLineCount({
			sublistId : 'item'
		});
		var recType = newRecord.type;

		for (var i = 0; i < lineCount; i++) {
			var ctnQty = newRecord.getSublistValue({
				sublistId : 'item',
				fieldId : 'custcol_tn_carton_qty',
				line : i
			});
			var packSize = newRecord.getSublistValue({
				sublistId : 'item',
				fieldId : 'custcol_tn_pack_size',
				line : i
			});
			var quantity = newRecord.getSublistValue({
				sublistId : 'item',
				fieldId : 'quantity',
				line : i
			});
			var oldQty = quantity;

			if (quantity !== '') {
				quantity = Math.ceil(quantity);
				if (oldQty != quantity) {
					newRecord.setSublistValue({
						sublistId : 'item',
						fieldId : 'quantity',
						line : i,
						value : quantity
					});
				}
			}

			if (packSize && quantity !== '' && ctnQty === '') {
				ctnQty = (quantity * 100) / (packSize * 100);
				newRecord.setSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_carton_qty',
					line : i,
					value : ctnQty
				});
			} else if (ctnQty && quantity !== '' && packSize === '') {
				packSize = (quantity * 100) / (ctnQty * 100);
				newRecord.setSublistValue({
					sublistId : 'item',
					fieldId : 'custcol_tn_pack_size',
					line : i,
					value : packSize
				});
			} else if (ctnQty !== '' && packSize !== '' && quantity === '') {
				quantity = ctnQty * packSize;
				quantity = Math.ceil(quantity);
				newRecord.setSublistValue({
					sublistId : 'item',
					fieldId : 'quantity',
					line : i,
					value : quantity
				});
			}
		}

		return newRecord;
	}
	return {
		onAction : onAction
	};

});
