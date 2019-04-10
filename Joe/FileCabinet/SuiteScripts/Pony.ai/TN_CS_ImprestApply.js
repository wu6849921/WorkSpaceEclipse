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
					currentRecord.selectNewLine({
						sublistId : 'recmachcustrecord_tn_imprestapply'
					});
				} catch (e) {
					alert(e);
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
					if (sublistFieldName == 'custrecord_tn_amount') {
						var amount = currentRecord.getValue({
							fieldId : sublistFieldName
						});
						currentRecord.setValue({
							fieldId : 'custrecord_tn_amountinwords',
							value : numToChinese(amount)
						});
					}
					if (sublistName === 'recmachcustrecord_tn_imprestapply') {
						if (sublistFieldName == 'custrecord_tn_detail_quantiy'
								|| sublistFieldName == 'custrecord_tn_detail_unitprice') {
							var quantiy = currentRecord
									.getCurrentSublistValue({
										sublistId : sublistName,
										fieldId : 'custrecord_tn_detail_quantiy'
									});
							var unitPrice = currentRecord
									.getCurrentSublistValue({
										sublistId : sublistName,
										fieldId : 'custrecord_tn_detail_unitprice'
									});
							if (quantiy && unitPrice) {
								currentRecord.setCurrentSublistValue({
									sublistId : sublistName,
									fieldId : 'custrecord_tn_detail_amount',
									value : quantiy * unitPrice
								});
							}
						}
						if (sublistFieldName == 'custrecord_tn_detail_startdate'
								|| sublistFieldName == 'custrecord_tn_detail_enddate') {
							var startDate = currentRecord
									.getCurrentSublistValue({
										sublistId : sublistName,
										fieldId : 'custrecord_tn_detail_startdate'
									});
							var endDate = currentRecord// 返回日期格式
							.getCurrentSublistValue({
								sublistId : sublistName,
								fieldId : 'custrecord_tn_detail_enddate'
							});
							if (startDate && endDate) {
								currentRecord.setCurrentSublistValue({
									sublistId : sublistName,
									fieldId : 'custrecord_tn_detail_days',
									value : (endDate - startDate)
											/ (1000 * 60 * 60 * 24)
								});
							}
						}
					}
				} catch (e) {
					alert(e);
				}

			}
			/**
			 * Function to be executed after sublist is inserted, removed, or
			 * edited.
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
			function sublistChanged(context) {
				var currentRecord = context.currentRecord;
				var sublistName = context.sublistId;
				var op = context.operation;
				if (sublistName === 'recmachcustrecord_tn_imprestapply') {
					var numLines = currentRecord.getLineCount({
						sublistId : 'recmachcustrecord_tn_imprestapply'
					});
					// alert(numLines);
					var totalAmt = 0;
					for (var i = 0; i < numLines; i++) {
						var lineAmount = currentRecord.getSublistValue({
							sublistId : sublistName,
							fieldId : 'custrecord_tn_detail_amount',
							line : i
						});
						totalAmt += lineAmount;
					}
					currentRecord.setValue({
						fieldId : 'custrecord_tn_amount',
						value : totalAmt
					});
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
				var amount = currentRecord.getValue({
					fieldId : 'custrecord_tn_amount'
				});
				var type = currentRecord.getValue({
					fieldId : 'custrecord_tn_type'
				});
				if (type == '1' && parseFloat(amount) <= 10000) {
					alert('专项类型的备用金申请单金额需要大于10000！');
					return false;
				}
				var _num = currentRecord.getValue({
					fieldId : 'custrecord_tn_number'
				});
				if (_num) {
					return true;
				}
				var subsidiaryId = currentRecord.getValue({
					fieldId : 'custrecord_tn_subsidiary'
				});
				var prefix = 'CAA';// 前缀
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
				search.create({
					type : 'customrecord_tn_imprestapply',
					// filters : filters,
					columns : [ 'custrecord_tn_number', search.createColumn({
						name : 'internalid',
						sort : search.Sort.DESC
					}) ]
				}).run().each(
						function(result) {
							// alert(name);
							var curNum = result.getValue({
								name : 'custrecord_tn_number'
							});
							curNum = curNum.substring(curNum.length - 6)
									.replace(/\b(0+)/gi, "");
							serialNum = parseInt(curNum) + 1;
						});
				var recNum = prefix + subPre + numFormat(serialNum + '', 6);
				currentRecord.setValue({
					fieldId : 'custrecord_tn_number',
					value : recNum
				});
				return true;
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
				currentRecord = context.currentRecord;
				var sublistName = context.sublistId;
				if (sublistName === 'recmachcustrecord_tn_imprestapply') {
					var date = currentRecord.getValue({
						fieldId : 'custrecord_tn_applydate'
					});
					if (date) {
						var lineDate = currentRecord.getCurrentSublistValue({
							sublistId : sublistName,
							fieldId : 'custrecord_tn_detail_startdate'
						});
						if (!lineDate) {
							currentRecord.setCurrentSublistValue({
								sublistId : sublistName,
								fieldId : 'custrecord_tn_detail_startdate',
								value : date
							});
						}
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
				if (sublistFieldName === 'custrecord_tn_imprestaccount'
						|| sublistFieldName === 'custrecord_tn_bankaccount') {
					var _account = currentRecord.getValue({
						fieldId : sublistFieldName
					});
					var subsidiary = currentRecord.getValue({
						fieldId : 'custrecord_tn_subsidiary'
					});
					if (!_account || !subsidiary) {
						return true;
					}
					var isMatch = false;
					search.create(
							{
								type : 'account',
								filters : [ [ 'internalid', 'is', _account ],
										'AND',
										[ 'subsidiary', 'anyof', subsidiary ] ]
							}).run().each(function(result) {
						isMatch = true;
					});
					if (!isMatch) {
						alert('你选的account不属于你选的subsidiary，请重新选择！');
						return false;
					}
				}
				return true;
			}
			function numFormat(str, len) {
				var strLen = str.length;
				for (i = 0; i < len - strLen; i++) {
					str = "0" + str;
				}
				return str;
			}
			function numToChinese(n) {
				if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(n))
					return "数据非法";
				var unit = "千百拾亿千百拾万千百拾元角分", str = "";
				n += "00";
				var p = n.indexOf('.');
				if (p >= 0)
					n = n.substring(0, p) + n.substr(p + 1, 2);
				unit = unit.substr(unit.length - n.length);
				for (var i = 0; i < n.length; i++)
					str += '零壹贰叁肆伍陆柒捌玖'.charAt(n.charAt(i)) + unit.charAt(i);
				return str.replace(/零(千|百|拾|角)/g, "零").replace(/(零)+/g, "零")
						.replace(/零(万|亿|元)/g, "$1").replace(/(亿)万|壹(拾)/g,
								"$1$2").replace(/^元零?|零分/g, "").replace(/元$/g,
								"元整");
			}
			return {
				saveRecord : saveRecord,
				fieldChanged : fieldChanged,
				lineInit : lineInit,
				sublistChanged : sublistChanged,
				pageInit : pageInit,
				validateField : validateField
			};
		});