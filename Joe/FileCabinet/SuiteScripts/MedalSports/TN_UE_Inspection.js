/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([ 'N/record', 'N/search' ],

function(record, search) {
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
	function beforeSubmit(context) {
		try {
			if (context.type == context.UserEventType.EDIT
					|| context.type == context.UserEventType.CREATE
					|| context.type == context.UserEventType.COPY) {
				var newRecord = context.newRecord;

				var poId = newRecord.getValue({
					fieldId : 'custrecord_tn_po'
				});
				var itemId = newRecord.getValue({
					fieldId : 'custrecord_tn_po_inspection_itemnum'
				});
				var poRecord = record.load({
					type : record.Type.PURCHASE_ORDER,
					id : poId,
					isDynamic : true,
				});
				var numLines = poRecord.getLineCount({
					sublistId : 'item'
				});

				var earlyShipDate;
				var shipDateF;
				var inType = 0;
				for (var i = 0; i < numLines; i++) {
					var itemIdPO = poRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'item',
						line : i
					});
					var esd = poRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'custcol_tn_po_esd',
						line : i
					});
					var shipDate = poRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'custcol_tn_po_shipdate',
						line : i
					});

					var inspectionType = poRecord.getSublistValue({
						sublistId : 'item',
						fieldId : 'custrecord_tn_po_inspection_inspectionty',
						line : i
					});
					if (itemIdPO == itemId) {
						earlyShipDate = esd;
						shipDateF = shipDate;
						inType = inspectionType;
					}
				}
				if (earlyShipDate) {
					newRecord.setValue({
						fieldId : 'custrecord_tn_po_inspection_esd',
						value : earlyShipDate
					});
				}
				if (shipDateF) {
					newRecord.setValue({
						fieldId : 'custrecord_tn_inspection_fsd',
						value : shipDateF
					});
				}

				// 计算inspectionDate
				var addDate = 0;
				switch (inType) {
				case 1:
					addDate = 90;
					break;
				case 2:
					addDate = 75;
					break;
				case 3:
					addDate = 45;
					break;
				case 4:
					addDate = 30;
					break;
				case 5:
					addDate = 30;
					break;
				case 6:
					addDate = 30;
					break;
				case 7:
					addDate = 10;
					break;
				case 8:
					addDate = 21;
					break;

				default:
					break;
				}
				var inspectionDate = earlyShipDate.setDate(earlyShipDate
						.getDate()
						+ addDate);
				if (inspectionDate) {
					newRecord.setValue({
						fieldId : 'custrecord_tn_po_inspection_inspectionda',
						value : inspectionDate
					});
				}
			}
		} catch (e) {
			log.debug({
				title : 'beforeSubmit',
				details : e
			});
		}
	}

	return {
		afterSubmit : afterSubmit,
	};

});
