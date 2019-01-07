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
	function afterSubmit(context) {
		try {
			if (context.type == context.UserEventType.EDIT
					|| context.type == context.UserEventType.CREATE
					|| context.type == context.UserEventType.COPY) {
				var newRecord = context.newRecord;
				var saleComm = newRecord.getValue({
					fieldId : 'custentity_tn_customer_salecomm'
				});
				var mddefall = newRecord.getValue({
					fieldId : 'custentity_tn_customer_mddefall'
				});
				var markDown = newRecord.getValue({
					fieldId : 'custentity_tn_customer_markdown'
				});
				var afterSer = newRecord.getValue({
					fieldId : 'custentity_tn_customer_afterservice'
				});
				var crSearch = search.create({
					type : 'customrecordcommissionrate',
					filters : [ [ 'custrecord_tn_cstmrcd_customer', 'is',
							newRecord.id ] ],
					columns : [ 'internalid' ]
				});

				crSearch.run().each(function(result) {
					var crId = result.id;
					var crRec = record.load({
						type : 'customrecordcommissionrate',
						id : crId
					});
					crRec.setValue({
						fieldId : 'custrecord_tn_cstmrcd_ocr',
						value : saleComm
					});
					crRec.setValue({
						fieldId : 'custrecord_tn_cstmrcd_da',
						value : mddefall
					});
					crRec.setValue({
						fieldId : 'custrecord_tn_cstmrcd_markdown',
						value : markDown
					});
					crRec.setValue({
						fieldId : 'custrecord_tn_cstmrcd_customer1',
						value : afterSer
					});
					crRec.save();
					return true;
				});

			}
		} catch (e) {
			log.debug({
				title : 'afterSubmit',
				details : e
			});
		}
	}

	return {
		afterSubmit : afterSubmit
	};

});
