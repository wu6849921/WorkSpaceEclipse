/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @author Joe
 * @appliedtorecord pl so iv
 */
define(
		[ 'N/record', 'N/search', 'N/currency' ],
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
					var sublistFieldName = context.fieldId;
					if (sublistFieldName == 'custrecord_tn_ref_impaccount') {
						var account = currentRecord.getValue({
							fieldId : sublistFieldName
						});
						var name = currentRecord.getValue({
							fieldId : 'custrecord_tn_ref_employee'
						});
						search
								.create(
										{
											type : 'transaction',
											filters : [
													[ 'account', 'anyof',
															account ], 'AND',
													[ 'posting', 'is', 'T' ],
													'AND',
													[ 'entity', 'anyof', name ] ],
											columns : [ search.createColumn({
												name : 'fxamount',
												summary : search.Summary.SUM
											}) ]
										})
								.run()
								.each(
										function(result) {
											// alert(name);
											var amount = result
													.getValue(result.columns[0]);
											currentRecord
													.setValue({
														fieldId : 'custrecord_tn_ref_refamount',
														value : amount
													});
										});
					}
				} catch (e) {
					alert(e);
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
			 *            scriptContext.lineNum - Line number. Will be undefined
			 *            if not a sublist or matrix field
			 * @param {number}
			 *            scriptContext.columnNum - Line number. Will be
			 *            undefined if not a matrix field
			 * 
			 * @returns {boolean} Return true if field is valid
			 * 
			 * @since 2015.2
			 */
			function validateField(context) {
				var currentRecord = context.currentRecord;
				var sublistFieldName = context.fieldId;
				if (sublistFieldName == 'custrecord_tn_ref_repamount') {
					var repAmount = currentRecord.getValue({
						fieldId : sublistFieldName
					});
					repAmount = repAmount ? repAmount : 0;
					var refAmount = currentRecord.getValue({
						fieldId : 'custrecord_tn_ref_refamount'
					});
					refAmount = refAmount ? refAmount : 0;
					if (refAmount <= 0) {
						alert('你没有可以还款的备用金!');
						return false;
					}
					if (repAmount > refAmount) {
						currentRecord.setValue({
							fieldId : 'custrecord_tn_ref_repamount',
							value : refAmount
						});
						return true;
					}
				}
				return true;
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
				var _num = currentRecord.getValue({
					fieldId : 'custrecord_tn_ref_number'
				});
				if (_num) {
					return true;
				}
				var subsidiaryId = currentRecord.getValue({
					fieldId : 'custrecord_tn_ref_subsidiary'
				});
				var prefix = 'CAS';// 前缀
				var subPre = '';// 公司代码
				var serialNum = 1; // 流水号
				var tranprefix = search.lookupFields({
					type : search.Type.SUBSIDIARY,
					id : subsidiaryId,
					columns : [ 'tranprefix' ]
				});
				if (tranprefix.tranprefix) {
					subPre = tranprefix.tranprefix;
				}
				// var filters = [];
				// if (currentRecord.id) {
				// filters.push([ 'internalid', 'isnot', currentRecord.id ]);
				// }
				search.create(
						{
							type : 'customrecord_tn_imprestrefund',
							// filters : filters,
							columns : [ 'custrecord_tn_ref_number',
									search.createColumn({
										name : 'internalid',
										sort : search.Sort.DESC
									}) ]
						}).run().each(
						function(result) {
							// alert(name);
							var curNum = result.getValue({
								name : 'custrecord_tn_ref_number'
							});
							curNum = curNum.substring(curNum.length - 6)
									.replace(/\b(0+)/gi, "");
							serialNum = parseInt(curNum) + 1;
						});
				var recNum = prefix + subPre + numFormat(serialNum + '', 6);
				currentRecord.setValue({
					fieldId : 'custrecord_tn_ref_number',
					value : recNum
				});
				return true;
			}

			/**
			 * Function to be executed after page is initialized.
			 * 
			 * @param {Object}
			 *            scriptContext
			 * @param {Record}
			 *            scriptContext.currentRecord - Current form record
			 * @param {string}
			 *            scriptContext.mode - The mode in which the record is
			 *            being accessed (create, copy, or edit)
			 * 
			 * @since 2015.2
			 */
			function pageInit(scriptContext) {
				try {
					var type = scriptContext.mode;
					var currentRecord = scriptContext.currentRecord;
					if (type == 'create') {
						var param = returnParam();
						// alert(JSON.stringify(param));
						currentRecord.setValue({
							fieldId : 'custrecord_tn_ref_type',
							value : param.type
						});
						currentRecord.setValue({
							fieldId : 'custrecord_tn_ref_employee',
							value : param.employee
						});
						currentRecord.setValue({
							fieldId : 'custrecord_tn_ref_bankaccount',
							value : param.bankAccount
						});
						currentRecord.setValue({
							fieldId : 'custrecord_tn_ref_impaccount',
							value : param.impAccount
						});
					}
				} catch (ex) {
					alert(ex);
				}
			}
			function returnParam() {
				var url = location.search; // 获取url中"?"符后的字串
				var theRequest = new Object();
				if (url.indexOf("?") != -1) {
					var str = url.substr(1);
					strs = str.split("&");
					for (var i = 0; i < strs.length; i++) {
						theRequest[strs[i].split("=")[0]] = unescape(strs[i]
								.split("=")[1]);
					}
				}
				return theRequest;
			}
			function numFormat(str, len) {
				var strLen = str.length;
				for (i = 0; i < len - strLen; i++) {
					str = "0" + str;
				}
				return str;
			}
			return {
				saveRecord : saveRecord,
				pageInit : pageInit,
				fieldChanged : fieldChanged,
				validateField : validateField
			};
		});