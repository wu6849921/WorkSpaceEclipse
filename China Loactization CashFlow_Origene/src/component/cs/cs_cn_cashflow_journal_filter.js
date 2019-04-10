/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @appliedtorecord JE
 */
define([ '../../app/cashflow/app_cn_cashflow_filter', 'N/record',
		'../../lib/commons', '../../lib/util' ],

function(filter, record, commons) {
	function clearCfsItem(context) {
		var currentRecord = context.currentRecord;
		var itemId = currentRecord.getCurrentSublistValue({
			sublistId : context.sublistId,
			fieldId : 'custcol_cseg_cn_cfi'
		});
		if (!commons.makesure(itemId)) {
			// Init a new line or EndGroup
			return;
		}
		currentRecord.setCurrentSublistValue({
			sublistId : context.sublistId,
			fieldId : 'custcol_cseg_cn_cfi',
			value : '',
			ignoreFieldChange : true
		});
	}

	var api = {
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
		 *            scriptContext.lineNum - Line number. Will be undefined if
		 *            not a sublist or matrix field
		 * @param {number}
		 *            scriptContext.columnNum - Line number. Will be undefined
		 *            if not a matrix field
		 * 
		 * @since 2015.2
		 */
		fieldChanged : function(scriptContext) {
			var currentRec = scriptContext.currentRecord;
			log.debug('cs_cn_cashflow_journal_filter', 'type='
					+ currentRec.type + ',id=' + currentRec.id);

			var sublistId = scriptContext.sublistId;
			var fieldId = scriptContext.fieldId;

			// Implement journal entry cfs item filter logic
			if (currentRec.type === record.Type.JOURNAL_ENTRY
					&& sublistId === 'line'
					&& (fieldId === 'credit' || fieldId === 'debit')) {
				if (filter.isClearCfsItem(currentRec, sublistId, fieldId)) {
					// clear current cfs item if available
					clearCfsItem(scriptContext);
				}
			}
		}
	};

	// Expose private method for UT
	api._clearCfsItem = clearCfsItem;
	return api;

});
