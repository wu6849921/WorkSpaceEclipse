/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define([], function() {

	var isChange = false;
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
	function pageInit(context) {
		try {
			var currentRecord = context.currentRecord;
			var numLines = currentRecord.getLineCount({
				sublistId : 'item'
			});
			for (var i = 0; i < numLines; i++) {
				var rate = currentRecord.getSublistField({
					sublistId : 'item',
					fieldId : 'rate',
					line : i
				});
				rate.isDisabled = true;
				currentRecord.commitLine({
					sublistId : 'item'
				});
			}
		} catch (ex) {
			alert(ex);
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
	function lineInit(context) {
		try {
			var currentRecord = context.currentRecord;
			var sublistId = context.sublistId;
			if (sublistId === 'item') {
				var currIndex = currentRecord.getCurrentSublistIndex({
					sublistId : sublistId
				});
				alert(currIndex);
				var rate = currentRecord.getSublistField({
					sublistId : sublistId,
					fieldId : 'rate',
					line : currIndex
				});
				rate.isDisabled = true;
			}
		} catch (ex) {
			alert(ex);
		}
	}
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
		var sublistId = context.sublistId;
		var fieldId = context.fieldId;
		var lineNum = context.lineNum;
		if (sublistId === 'item') {
			if (fieldId === 'rate') {
				alert('请在item上设置该字段！否则改item不可用！');
				// return false;
				// isChange = true;
			}
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
		if (sublistId === 'item') {
			if (fieldId === 'rate') {
				var rate = currentRecord.getCurrentSublistValue({
					sublistId : sublistId,
					fieldId : 'rate'
				});
				if (rate == '') {
					return true;
				}
				if (isChange) {
					alert('你无法设置字段的值！');
					return false;
				}
				isChange = false;
			}
		}
		return true;
	}

	/**
	 * Validation function to be executed when sublist line is inserted.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
	 * 
	 * @returns {boolean} Return true if sublist line is valid
	 * 
	 * @since 2015.2
	 */
	function validateInsert(scriptContext) {
		alert(1);
	}
	/**
	 * Function to be executed when field is slaved.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
	 * @param {string}
	 *            scriptContext.fieldId - Field name
	 * 
	 * @since 2015.2
	 */
	function postSourcing(context) {
		var currentRecord = context.currentRecord;
		var sublistId = context.sublistId;
		var fieldId = context.fieldId;
		if (sublistId === 'item') {
			if (fieldId === 'rate') {
				alert(1);
				// var rate = currentRecord.getCurrentSublistValue({
				// sublistId : sublistId,
				// fieldId : 'rate'
				// });
				// if (rate == '') {
				// return true;
				// }
				// if (isChange) {
				// alert('你无法设置字段的值！');
				// return false;
				// }
				// isChange = false;
				var currIndex = currentRecord.getCurrentSublistIndex({
					sublistId : sublistId
				});
				alert(currIndex);
				var rate = currentRecord.getSublistField({
					sublistId : sublistId,
					fieldId : fieldId,
					line : currIndex
				});
				rate.isDisabled = true;
			}
		}
	}
	/**
	 * Validation function to be executed when sublist line is committed.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.sublistId - Sublist name
	 * 
	 * @returns {boolean} Return true if sublist line is valid
	 * 
	 * @since 2015.2
	 */
	function validateLine(context) {
		try {
			var currentRecord = context.currentRecord;
			var sublistId = context.sublistId;
			if (sublistId === 'item') {
				var currIndex = currentRecord.getCurrentSublistIndex({
					sublistId : sublistId
				});
				alert(currIndex);
				var rateFeild = currentRecord.getSublistField({
					sublistId : 'item',
					fieldId : 'rate',
					line : currIndex
				});
				var rate = currentRecord.getCurrentSublistValue({
					sublistId : sublistId,
					fieldId : 'rate'
				});
				if (!rateFeild.isDisabled && rate != '') {
					return false;
				}
			}
			return true;
		} catch (ex) {
			alert(ex);
		}
	}

	/**
	 * Validation function to be executed when record is saved.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @returns {boolean} Return true if record is valid
	 * 
	 * @since 2015.2
	 */
	function saveRecord(context) {
		try {
			var currentRecord = context.currentRecord;
			var numLines = currentRecord.getLineCount({
				sublistId : 'item'
			});
			for (var i = 0; i < numLines; i++) {
				// alert(i);
				var rateFeild = currentRecord.getSublistField({
					sublistId : 'item',
					fieldId : 'rate',
					line : i
				});
				// alert(rateFeild.isDisabled + '|' + rateFeild.isReadOnly);
				var rate = currentRecord.getSublistValue({
					sublistId : 'item',
					fieldId : 'rate',
					line : i
				});
				// alert(rate);
				j = i + 1;
				if (!rateFeild.isDisabled) {
					alert('rate字段无法编辑，请修改item！item的位置在第' + j + '条');
					return false;
				}
			}
			return true;

		} catch (ex) {
			alert(ex);
		}
	}
	return {
		// lineInit : lineInit
		// fieldChanged : fieldChanged
		// pageInit : pageInit
		// validateField : validateField
		// validateInsert : validateInsert
		// postSourcing : postSourcing
		// validateLine : validateLine
		saveRecord : saveRecord
	}
});
