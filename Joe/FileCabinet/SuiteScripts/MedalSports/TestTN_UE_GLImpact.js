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
	 * @param {string}
	 *            scriptContext.type - Trigger type
	 * @param {Form}
	 *            scriptContext.form - Current form
	 * @Since 2015.2
	 */
	function beforeLoad(context) {
	}

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
		log.debug({
			title : 'afterSubmit'
		});
		try {
			if (context.type == context.UserEventType.EDIT
					|| context.type == context.UserEventType.CREATE
					|| context.type == context.UserEventType.COPY) {
				var newRecord = context.newRecord;
				var lineCount = newRecord.getLineCount({
					sublistId : 'item'
				});

				// create JE
				var freeSearch = search
						.create({
							type : 'customrecord_feecalculation1',
							filters : [ [ 'custrecord_innumber', 'is',
									newRecord.id ] ],
							columns : [ 'internalid' ]
						});
				freeSearch.run().each(function(result) {
					var freeId = result.id;
					var freeRec = record.load({
						type : 'customrecord_feecalculation1',
						id : freeId
					});
					var debitAccount = freeRec.getValue({
						fieldId : 'custrecord2'
					});
					var creditAcoount = freeRec.getValue({
						fieldId : 'custrecord3'
					});
					var amount = freeRec.getValue({
						fieldId : 'custrecord_feeamount'
					});
					var jeRec = record.create({
						type : record.Type.JOURNAL_ENTRY,
						isDynamic : true
					});

					jeRec.selectNewLine({
						sublistId : 'line'
					});
					jeRec.setCurrentSublistValue({
						sublistId : 'line',
						fieldId : 'account',
						value : debitAccount
					});
					jeRec.setCurrentSublistValue({
						sublistId : 'line',
						fieldId : 'debit',
						value : amount
					});
					jeRec.commitLine({
						sublistId : 'line'
					});

					jeRec.selectNewLine({
						sublistId : 'line'
					});
					jeRec.setCurrentSublistValue({
						sublistId : 'line',
						fieldId : 'account',
						value : creditAcoount
					});
					jeRec.setCurrentSublistValue({
						sublistId : 'line',
						fieldId : 'credit',
						value : amount
					});
					jeRec.commitLine({
						sublistId : 'line'
					});

					jeId = jeRec.save({
						ignoreMandatoryFields : true
					});
					log.debug({
						title : 'jeId',
						details : jeId
					});
					return true;
				});

			}
		} catch (e) {
			log.debug({
				title : 'beforeSubmit',
				details : e
			});
		}

	}

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
	function beforeSubmit(scriptContext) {

	}

	return {
		// beforeLoad : beforeLoad
		// beforeSubmit : beforeSubmit
		afterSubmit : afterSubmit
	}

});
