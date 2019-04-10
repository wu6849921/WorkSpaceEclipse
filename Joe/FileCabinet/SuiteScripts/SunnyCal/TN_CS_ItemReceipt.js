/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @author Joe
 * @appliedtorecord pl so iv
 */
define([ 'N/record', 'N/format' ], function(record, format) {
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
			var fieldName = context.fieldId;
			if (sublistName === 'item'
					&& fieldName === 'custcol_tn_itemrecei_startdate') {
				var warrantyStartDate = currentRecord.getCurrentSublistValue({
					sublistId : sublistName,
					fieldId : fieldName
				});
				if (!warrantyStartDate) {
					return;
				}
//				var item = currentRecord.getCurrentSublistValue({
//					sublistId : sublistName,
//					fieldId : 'linenumber'
//				});
//				alert(item);
				warrantyStartDate = format.format({
					value : warrantyStartDate,
					type : format.Type.DATE
				});
				var id = record.submitFields({
					type : 'customrecord_tn_tmp',
					id :'1',
					values : {
						custrecord_tn_tmp_date : warrantyStartDate
					}
				});
			}
		} catch (e) {
			alert(e);
		}
	}
	/**
	 * Function to be executed after line is selected.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
	 * 
	 * @since 2015.2
	 */
	function pageInit(context) {
		try {
			var currentRecord = context.currentRecord;
			var date =currentRecord.getValue({
				fieldId:'trandate'
			});
			date = format.format({
				value : date,
				type : format.Type.DATE
			});
			var id = record.submitFields({
				type : 'customrecord_tn_tmp',
				id :'1',
				values : {
					custrecord_tn_tmpdatemain : date
				}
			});
		} catch (e) {
			alert(e);
		}

	}
	return {
		pageInit:pageInit,
		fieldChanged : fieldChanged
	};
});