/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @Nauthor Trigger Joe
 * @Nversion 1.0 20180319
 */
define([ 'N/search' ], function(search) {
	/**
	 * Function to be executed after page is initialized.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.mode - The mode in which the record is being
	 *            accessed (create, copy, or edit)
	 * 
	 * @since 2015.2
	 */
	function fieldChanged(context) {
		var currentRecord = context.currentRecord;
		var fieldName = context.fieldId;
		if (fieldName === 'custrecord_tn_l' || fieldName === 'custrecord_tn_w'
				|| fieldName === 'custrecord_tn_h') {
			var lSize = currentRecord.getValue({
				fieldId : 'custrecord_tn_l'
			});
			var wSize = currentRecord.getValue({
				fieldId : 'custrecord_tn_w'
			});
			var hSize = currentRecord.getValue({
				fieldId : 'custrecord_tn_h'
			});
			if (lSize && wSize && hSize) { 
				currentRecord.setValue({
					fieldId : 'custrecord_tn_cuft',
					value : lSize * wSize * hSize / 1728
				});
				currentRecord.setValue({
					fieldId : 'custrecord_tn_cbm',
					value : lSize * wSize * hSize / 1728 / 35.315
				});
			}
		}
		if (fieldName === 'custrecord_tn_pif_grossweight') {
			var grossweight = currentRecord.getValue({
				fieldId : 'custrecord_tn_pif_grossweight'
			});
			currentRecord.setValue({
				fieldId : 'custrecord_tn_pif_grossweightlb',
				value:grossweight*2.2
			});
		}
		if (fieldName === 'custrecord_tn_pif_netweightkg') {
			var netweightkg = currentRecord.getValue({
				fieldId : 'custrecord_tn_pif_netweightkg'
			});
			currentRecord.setValue({
				fieldId : 'custrecord_tn_pif_netweightlb',
				value:netweightkg*2.2
			});
		}
	}

	return {
		fieldChanged : fieldChanged
	};
});