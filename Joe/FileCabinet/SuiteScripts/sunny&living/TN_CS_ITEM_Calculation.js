/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @Author Trigger Charles
 * @Version 1.0
 */
define([ 'N/ui/dialog', 'N/search', 'N/record' ], function(dialog, search,
		record) {

	// entry points
	function fieldChanged(context) {
		try {
			var record = context.currentRecord;
			var fieldId = context.fieldId;
			if (fieldId === 'custitem_tn_out_length'
					|| fieldId === 'custitem_tn_out_width'
					|| fieldId === 'custitem_tn_out_height'
					|| fieldId === 'custitem_tn_pack_size') {// 计算材积
				var length = record.getValue({
					fieldId : 'custitem_tn_out_length'
				});
				var width = record.getValue({
					fieldId : 'custitem_tn_out_width'
				});
				var height = record.getValue({
					fieldId : 'custitem_tn_out_height'
				});
				var packSize = record.getValue({
					fieldId : 'custitem_tn_pack_size'
				});
				var divisor = 1000000;

				length = parseFloat(length) || 0;
				width = parseFloat(width) || 0;
				height = parseFloat(height) || 0;
				packSize = parseFloat(packSize) || 0;

				var cbm = length * width * height / divisor;

				record.setValue({// OUTER CARTON CBM
					fieldId : 'custitem_tn_out_car_cbm',
					value : cbm.toFixed(4)
				});

				record.setValue({// LOADING QTY FOR 40'CONTAINER（56/CBM*PACK
					// SIZE）
					fieldId : 'custitem_tn_load_40',
					value : cbm ? (56 / cbm * packSize).toFixed(2) : 0.00
				});

				record.setValue({// LOADING QTY FOR 40'HQ
					// CONTAINER（65/CBM*PACK SIZE)
					fieldId : 'custitem_tn_load_40hq',
					value : cbm ? (65 / cbm * packSize).toFixed(2) : 0.00
				});

				record.setValue({// LOADING QTY FOR 45'CONTAINER （75/CBM*PACK
					// SIZE)
					fieldId : 'custitem_tn_load_45',
					value : cbm ? (75 / cbm * packSize).toFixed(2) : 0.00
				});
			}
		} catch (ex) {
			dialog.alert({
				title : 'Set field error',
				message : ex.toString()
			});
		}
	}
	/**
	 * Validation function to be executed when field is changed.
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
	 * @returns {boolean} Return true if field is valid
	 * 
	 * @since 2015.2
	 */
	function validateField(context) {
		var currentRecord = context.currentRecord;
		var sublistId = context.sublistId;
		var fieldId = context.fieldId;
		if (sublistId === 'itemvendor') {
			if (fieldId === 'vendor') {
				var vendorId = currentRecord.getCurrentSublistValue({
					sublistId : 'itemvendor',
					fieldId : 'vendor'
				});
				var appStatus = search.lookupFields({
					type : 'vendor',
					id : vendorId,
					columns : 'custentity_tn_app_status'
				});
				appStatus = appStatus.custentity_tn_app_status[0];
				if (!appStatus) {
					return true;
				}
				appStatus = appStatus.value;
				if (appStatus !== '2') {
					alert('该供应商未通过审批，无法使用！');
					return false;
				}
			}
		}
		return true;
	}
	return {
		fieldChanged : fieldChanged,
		validateField : validateField
	};
});
