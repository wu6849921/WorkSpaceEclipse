/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @author Joe
 * @appliedtorecord pl so iv
 */
define([ 'N/record', 'N/search', 'N/currency' ],
		function(record, search, currency) {
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
			 *            scriptContext.lineNum - Line number. Will be undefined
			 *            if not a sublist or matrix field
			 * 
			 * @since 2015.2
			 */
			function fieldChanged(context) {
				try {
					var currentRecord = context.currentRecord;
					var sublistName = context.sublistId;
					var sublistFieldName = context.fieldId;
					if (sublistFieldName === 'custrecord_tn_cstmrcd_cb1') {
						var ifCB = currentRecord.getValue({
							fieldId : 'custrecord_tn_cstmrcd_cb1'
						});
						if (!ifCB) {
							currentRecord.setValue({
								fieldId : 'custrecord_tn_cstmrcd_da',
								value : 0
							});
						}
					}
					if (sublistFieldName === 'custrecord_tn_cstmrcd_cb2') {
						var ifCB = currentRecord.getValue({
							fieldId : 'custrecord_tn_cstmrcd_cb2'
						});
						if (!ifCB) {
							currentRecord.setValue({
								fieldId : 'custrecord_tn_cstmrcd_markdown',
								value : 0
							});
						}
					}
					if (sublistFieldName === 'custrecord_tn_cstmrcd_cb3') {
						var ifDA = currentRecord.getValue({
							fieldId : 'custrecord_tn_cstmrcd_cb3'
						});
						if (!ifDA) {
							currentRecord.setValue({
								fieldId : 'custrecord_tn_cstmrcd_customer1',
								value : 0
							});
						}
					}
				} catch (e) {
					if (e instanceof nlobjError) {
						alert('Code:' + e.getCode() + ' Details:'
								+ e.getDetails());
					} else {
						alert(e.message);
					}
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
				var currentRecord = context.currentRecord;
				var ocr = currentRecord.getValue({
					fieldId : 'custrecord_tn_cstmrcd_ocr'
				});
				var da = currentRecord.getValue({
					fieldId : 'custrecord_tn_cstmrcd_da'
				});
				var markdown = currentRecord.getValue({
					fieldId : 'custrecord_tn_cstmrcd_markdown'
				});
				var afterSer = currentRecord.getValue({
					fieldId : 'custrecord_tn_cstmrcd_customer1'
				});
				var otherFee = currentRecord.getValue({
					fieldId : 'custrecord8'
				});
				var finalRate = ocr
						* (100 - da - markdown - afterSer - otherFee) / 100;
				currentRecord.setValue({
					fieldId : 'custrecord_tn_cstmrcd_fcr',
					value : finalRate
				});
				return true;
			}

			return {
				fieldChanged : fieldChanged,
				saveRecord : saveRecord
			};
		});