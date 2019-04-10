/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @Nauthor Trigger Joe
 * @Nversion 1.0 20180319
 */
define(
		[ 'N/record', 'N/search', 'N/transaction', 'N/format' ],
		function(record, search, transaction, format) {
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
			 * @param {number}
			 *            scriptContext.columnNum - Line number. Will be
			 *            undefined if not a matrix field
			 * 
			 * @since 2015.2
			 */
			function fieldChanged(context) {
				// 第二步：筛选并填充sublist
				var currentRecord = context.currentRecord;
				var sublistName = context.sublistId;
				var sublistFieldName = context.fieldId;
				if (sublistFieldName === 'custrecord_tn_sumje_trandate'
						|| sublistFieldName === 'custrecord_tn_sumje_jetype'
						|| sublistFieldName === 'custrecord_tn_subsidiary2') {
					var tranDate = currentRecord.getValue({
						fieldId : 'custrecord_tn_sumje_trandate'
					});
					var transactionTypeId = currentRecord.getValue({
						fieldId : 'custrecord_tn_sumje_jetype'
					});
					var subsidiary = currentRecord.getValue({
						fieldId : 'custrecord_tn_subsidiary2'
					});
					// 准备筛选条件
					var addFilters = [];
					var mySearch;
					if (!transactionTypeId || !subsidiary || !tranDate) {
						return;
					}
					var initFilter = [ 'custbody_tn_glnum', 'isempty', null ];
					var initColumn = [ 'transactionnumber', 'account',
							'debitamount', 'creditamount', 'memo', 'name',
							'subsidiary', 'department', 'class', 'location',
							'custcol_cseg_tn_area', 'currency', 'exchangerate',
							'type', 'tranid', 'custbody_tn_mpnumber',
							'fxamount' ];
					if (transactionTypeId) {
						switch (transactionTypeId) {
						case '1':// 费用支出申请单
							mySearch = search.create({
								type : search.Type.VENDOR_BILL,
								filters : [
										initFilter,
										'AND',
										[ 'subsidiary', 'is', subsidiary ],
										'AND',
										[ 'posting', 'is', 'T' ],
										'AND',
										[ 'custbody_tn_bill_vendor2', 'anyof',
												'@NONE@' ], 'AND',
										[ 'createdfrom', 'anyof', '@NONE@' ] ],
								columns : initColumn
							});
							break;
						case '2':// Vendor Bill(AP)
							mySearch = search
									.create({
										type : search.Type.VENDOR_BILL,
										filters : [
												initFilter,
												'AND',
												[ 'subsidiary', 'is',
														subsidiary ],
												'AND',
												[ 'posting', 'is', 'T' ],
												'AND',
												[ 'custbody_tn_bill_vendor2',
														'anyof', '@NONE@' ],
												'AND',
												[ 'createdfrom', 'noneof',
														'@NONE@' ] ],
										columns : initColumn
									});
							break;
						case '3':// Customer Invoice(AR)
							mySearch = search.create({
								type : search.Type.INVOICE,
								filters : [
										initFilter,
										'AND',
										[ 'subsidiary', 'is', subsidiary ],
										'AND',
										[ 'posting', 'is', 'T' ],
										'AND',
										[ 'custbody_tn_invoice_onhalfcustomer',
												'anyof', '@NONE@' ] ],
								columns : initColumn
							});
							break;
						case '4':// Manual JE
							mySearch = search.create({
								type : search.Type.JOURNAL_ENTRY,
								filters : [
										initFilter,
										'AND',
										[ 'subsidiary', 'is', subsidiary ],
										'AND',
										[ 'custbody_tn_mpnumber', 'isempty',
												null ] ],
								columns : initColumn
							});
							break;
						case '5':// Employee expense
							mySearch = search
									.create({
										type : search.Type.EXPENSE_REPORT,
										filters : [
												initFilter,
												'AND',
												[ 'subsidiary', 'is',
														subsidiary ],
												'AND',
												[ 'approvalstatus', 'anyof',
														'1' ],
												'AND',
												[ 'custbody_tn_er_approved',
														'is', 'T' ] ],
										columns : initColumn
									});
							break;
						case '6':// Payment 多类型加载保存的savedsearch
							// billpayment&payment&合并付款生成的JE
							// alert('Payment');
							mySearch = search.load({
								id : 'customsearch_tn_merseglpayment'
							});
							mySearch.filterExpression = mySearch.filterExpression
									.concat([ 'AND', initFilter ]);
							mySearch.filterExpression = mySearch.filterExpression
									.concat([ 'AND',
											[ 'subsidiary', 'is', subsidiary ] ]);
							// test.run().each(function(result) {
							// alert(result.id);
							// return true;
							// });
							break;
						case '7':// Item Fulfillment
							mySearch = search.create({
								type : search.Type.ITEM_FULFILLMENT,
								filters : [ initFilter, 'AND',
										[ 'subsidiary', 'is', subsidiary ] ],
								columns : initColumn
							});
							break;
						case '8':// Item Receipt
							mySearch = search.create({
								type : search.Type.ITEM_RECEIPT,
								filters : [ initFilter, 'AND',
										[ 'subsidiary', 'is', subsidiary ] ],
								columns : initColumn
							});
							break;
						case '9':// Manufacture 多类型加载保存的savedsearch
							// Assembly build&Assembly unbuild
							mySearch = search.load({
								id : 'customsearch_tn_merseglmanuf'
							});
							mySearch.filterExpression = mySearch.filterExpression
									.concat([ 'AND', initFilter ]);
							mySearch.filterExpression = mySearch.filterExpression
									.concat([ 'AND',
											[ 'subsidiary', 'is', subsidiary ] ]);
							break;
						case '10':// 代付 多类型加载保存的savedsearch Bill&Bill Credit
							mySearch = search.load({
								id : 'customsearch_tn_merseglpfa'
							});
							mySearch.filterExpression = mySearch.filterExpression
									.concat([ 'AND', initFilter ]);
							mySearch.filterExpression = mySearch.filterExpression
									.concat([ 'AND',
											[ 'subsidiary', 'is', subsidiary ] ]);
							break;
						case '11':// 代收 多类型加载保存的savedsearch Invoice&Credit
							// Memo
							mySearch = search.load({
								id : 'customsearch_tn_merseglcolle'
							});
							mySearch.filterExpression = mySearch.filterExpression
									.concat([ 'AND', initFilter ]);
							mySearch.filterExpression = mySearch.filterExpression
									.concat([ 'AND',
											[ 'subsidiary', 'is', subsidiary ] ]);
							break;
						case '12':// Others 多类型加载保存的savedsearch Bill
							// Credit&Cheque&Credit Memo&Currency
							// Revalution&Customer
							// Deposit&inventory Adjustment
							// 先查询所有用过的Ids
							var usedIds = getUsedOthersIds(search, tranDate);
							mySearch = search.load({
								id : 'customsearch_tn_merseglother'
							});
							if (usedIds && usedIds.length > 0) {
								// alert(usedIds);
								mySearch.filterExpression = mySearch.filterExpression
										.concat([
												'AND',
												[ 'internalid', 'noneof',
														usedIds ] ]);
							}
							mySearch.filterExpression = mySearch.filterExpression
									.concat([ 'AND', initFilter ]);
							mySearch.filterExpression = mySearch.filterExpression
									.concat([ 'AND',
											[ 'subsidiary', 'is', subsidiary ] ]);
							// alert(mySearch.filterExpression);

							break;
						default:
							break;
						}
					}

					// 测试先return joe
					// return;

					if (!tranDate) {
						tranDate = new Date();
					}
					// tranDate = tranDate.getDate() + '/' +
					// (tranDate.getMonth() +
					// 1)
					// + '/' + tranDate.getFullYear();
					tranDate = format.format({
						value : tranDate,
						type : format.Type.DATE
					});
					addFilters.push('AND', [ 'trandate', 'on', tranDate ]);

					// alert(addFilters);
					// 填充sublist
					if (addFilters.length) {
						// 删除现有line
						var numLines = currentRecord.getLineCount({
							sublistId : 'custpage_tn_mergegl_lines'
						});
						for (var i = 0; i < numLines; i++) {
							currentRecord.removeLine({
								sublistId : 'custpage_tn_mergegl_lines',
								line : 0
							});
						}

						// 加载并填充数据
						mySearch.filterExpression = mySearch.filterExpression
								.concat(addFilters);

						var line = 1;
						mySearch
								.run()
								.each(
										function(result) {
											// var tranName = result
											// .getValue(result.columns[0]);
											var account = result
													.getValue(result.columns[1]);
											var debitAmount = result
													.getValue(result.columns[2]);
											var creditAmount = result
													.getValue(result.columns[3]);
											var memo = result
													.getValue(result.columns[4]);
											var name = result
													.getText(result.columns[5]);
											var subsidiary = result
													.getValue(result.columns[6]);
											var department = result
													.getValue(result.columns[7]);
											var classV = result
													.getValue(result.columns[8]);
											var location = result
													.getValue(result.columns[9]);
											var area = result
													.getText(result.columns[10]);
											var currency = result
													.getValue(result.columns[11]);
											var exchangeRate = result
													.getValue(result.columns[12]);
											var type = result
													.getValue(result.columns[13]);
											var tranId = result
													.getValue(result.columns[0]);
											var mpNum = result
													.getValue(result.columns[15]);
											var fCurrencyAmount = result
													.getValue(result.columns[16]);
											// alert(2);

											// 如果amount都为0则不显示
											if (!debitAmount && !creditAmount) {
												return true
											}
											var recordType;
											var recordNum;
											// 如果muNum有值，来源就为mergepayment
											if (mpNum) {
												recordType = 'Merge Payment';
												recordNum = mpNum;
											} else {
												recordType = type;
												recordNum = tranId;
											}
											// 计算原币金额
											// var objRecord = record.load({
											// type : result.recordType,
											// id : result.id
											// });
											// // var fCurrencyAmount =
											// objRecord
											// // .getValue({
											// // fieldId : 'total'
											// // });
											// var fCurrencyAmount = objRecord
											// .getValue({
											// fieldId : 'toamount'
											// });
											if (!fCurrencyAmount) {
												if (!debitAmount) {
													debitAmount = 0;
													fCurrencyAmount = creditAmount
															/ exchangeRate;
												}
												if (!creditAmount) {
													creditAmount = 0;
													fCurrencyAmount = debitAmount
															/ exchangeRate;
												}
											}
											// 填充sublist
											var _line = currentRecord
													.selectNewLine({
														sublistId : 'custpage_tn_mergegl_lines'
													});
											// 序号
											_line
													.setCurrentSublistValue({
														sublistId : 'custpage_tn_mergegl_lines',
														fieldId : 'custpage_list_index',
														value : line,
													});
											_line
													.setCurrentSublistValue({
														sublistId : 'custpage_tn_mergegl_lines',
														fieldId : 'custpage_list_type',
														value : recordType
													});
											if (recordNum) {
												_line
														.setCurrentSublistValue({
															sublistId : 'custpage_tn_mergegl_lines',
															fieldId : 'custpage_list_num',
															value : recordNum
														});
											}
											// 单据名
											_line
													.setCurrentSublistValue({
														sublistId : 'custpage_tn_mergegl_lines',
														fieldId : 'custpage_list_transactionname',
														value : result.id
													});
											// alert(account);
											// 科目
											_line
													.setCurrentSublistValue({
														sublistId : 'custpage_tn_mergegl_lines',
														fieldId : 'custpage_list_account',
														value : account
													});
											// 借方金额
											_line
													.setCurrentSublistValue({
														sublistId : 'custpage_tn_mergegl_lines',
														fieldId : 'custpage_list_debitamount',
														value : debitAmount
													});
											// 贷方金额
											_line
													.setCurrentSublistValue({
														sublistId : 'custpage_tn_mergegl_lines',
														fieldId : 'custpage_list_creditamount',
														value : creditAmount
													});
											// currency
											_line
													.setCurrentSublistValue({
														sublistId : 'custpage_tn_mergegl_lines',
														fieldId : 'custpage_list_currency',
														value : currency
													});
											// fCurrencyAmount
											_line
													.setCurrentSublistValue({
														sublistId : 'custpage_tn_mergegl_lines',
														fieldId : 'custpage_list_amtfcurrency',
														value : returnFloat(fCurrencyAmount)
													});
											// memo
											_line
													.setCurrentSublistValue({
														sublistId : 'custpage_tn_mergegl_lines',
														fieldId : 'custpage_list_memo',
														value : memo
													});
											// name
											_line
													.setCurrentSublistValue({
														sublistId : 'custpage_tn_mergegl_lines',
														fieldId : 'custpage_list_name',
														value : name
													});
											// subsidiary
											_line
													.setCurrentSublistValue({
														sublistId : 'custpage_tn_mergegl_lines',
														fieldId : 'custpage_list_subsidiary',
														value : subsidiary
													});
											// department
											_line
													.setCurrentSublistValue({
														sublistId : 'custpage_tn_mergegl_lines',
														fieldId : 'custpage_list_department',
														value : department
													});
											// class
											_line
													.setCurrentSublistValue({
														sublistId : 'custpage_tn_mergegl_lines',
														fieldId : 'custpage_list_class',
														value : classV
													});
											// location
											_line
													.setCurrentSublistValue({
														sublistId : 'custpage_tn_mergegl_lines',
														fieldId : 'custpage_list_location',
														value : location
													});
											// area
											_line
													.setCurrentSublistValue({
														sublistId : 'custpage_tn_mergegl_lines',
														fieldId : 'custpage_list_area',
														value : area
													});

											_line
													.commitLine({
														sublistId : 'custpage_tn_mergegl_lines'
													});
											line++;
											return true;
										});

					}
				}
				if (sublistFieldName === 'custpage_tn_markall') {
					var markall = currentRecord.getValue({
						fieldId : 'custpage_tn_markall'
					});
					// var isSelect = markall == true ? 'T' : 'F';
					var numLines = currentRecord.getLineCount({
						sublistId : 'custpage_tn_mergegl_lines'
					});
					for (var i = 0; i < numLines; i++) {
						var _line = currentRecord.selectLine({
							sublistId : 'custpage_tn_mergegl_lines',
							line : i
						});
						_line.setCurrentSublistValue({
							sublistId : 'custpage_tn_mergegl_lines',
							fieldId : 'custpage_list_selected',
							value : markall
						});
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
				// 第三步：保存前生成GLNum
				try {
					var currentRecord = context.currentRecord;
					// 判断是否有记录被选择
					var numLines = currentRecord.getLineCount({
						sublistId : 'custpage_tn_mergegl_lines'
					});
					var isSelect = false;
					for (var i = 0; i < numLines; i++) {
						// 单据名
						var isS = currentRecord.getSublistValue({
							sublistId : 'custpage_tn_mergegl_lines',
							fieldId : 'custpage_list_selected',
							line : i
						});
						if (isS) {
							isSelect = true;
							break;
						}
					}
					if (!isSelect) {
						alert('請選擇傳票！');
						return false;
					}
					// if (numLines == 0) {
					// alert('請選擇傳票！');
					// return false;
					// }
					var numPrefix = 'JE-FY';
					// var date = new Date();
					var date = currentRecord.getValue({
						fieldId : 'custrecord_tn_sumje_trandate'
					});
					numPrefix += (date.getFullYear() + '').substr(2);
					numPrefix += PrefixInteger((date.getMonth() + 1), 2)
							+ PrefixInteger(date.getDate(), 2);

					var today = format.format({
						value : date,
						type : format.Type.DATE
					});
					var mgSearch = search.create({
						type : 'customrecord_tn_mergegl',
						filters : [ [ 'custrecord_tn_sumje_trandate', 'on',
								today ] ],
						columns : [ 'custrecord_tn_sumje_glnum' ]
					});
					// var count = 1;
					var glNum;
					mgSearch.run().each(function(result) {
						// count++
						glNum = result.getValue({
							name : 'custrecord_tn_sumje_glnum'
						});
						// alert(glNum);
						return true;
					});
					if (glNum) {
						glNum = glNum.substr(glNum.length - 3);
						if (glNum.substring(0, 1) == '0') {
							glNum = parseInt(glNum.substr(1)) + 1;
						} else {
							glNum = parseInt(glNum) + 1;
						}
						glNum = PrefixInteger(glNum, 3);
					} else {
						glNum = '001';
					}
					// count = PrefixInteger(count, 3);
					numPrefix += glNum;
					currentRecord.setValue({
						fieldId : 'custrecord_tn_sumje_glnum',
						value : numPrefix
					});

					// 如果是others类型，则将id记录在transaction ids字段中
					var transactionTypeId = currentRecord.getValue({
						fieldId : 'custrecord_tn_sumje_jetype'
					});
					// alert(transactionTypeId);
					if (transactionTypeId == '12') {
						var numLines = currentRecord.getLineCount({
							sublistId : 'custpage_tn_mergegl_lines'
						});
						var tranIds = [];
						for (var i = 0; i < numLines; i++) {
							var isSelect = currentRecord.getSublistValue({
								sublistId : 'custpage_tn_mergegl_lines',
								fieldId : 'custpage_list_selected',
								line : i
							});
							var recordId = currentRecord.getSublistValue({
								sublistId : 'custpage_tn_mergegl_lines',
								fieldId : 'custpage_list_transactionname',
								line : i
							});
							if (isSelect && tranIds.indexOf(recordId) == -1) {
								tranIds.push(recordId);
							}
						}
						var tranIdStr = tranIds.join(',');
						// alert(tranIdStr);
						currentRecord.setValue({
							fieldId : 'custrecord_transactionids',
							value : tranIdStr
						});
					}
					return true;
				} catch (e) {
					alert(e);
				}
			}

			function getUsedOthersIds(search, tranDate) {
				var usedIds = [];
				if (!tranDate) {
					tranDate = new Date();
				}
				// tranDate = tranDate.getDate() + '/' +
				// (tranDate.getMonth() +
				// 1)
				// + '/' + tranDate.getFullYear();
				tranDate = format.format({
					value : tranDate,
					type : format.Type.DATE
				});
				// addFilters.push('AND', [ 'trandate', 'on', tranDate ]);
				var pagedData = search
						.create(
								{
									type : 'customrecord_tn_mergegl',
									filters : [
											[ 'custrecord_tn_sumje_jetype',
													'is', '12' ],
											'AND',
											[ 'custrecord_tn_sumje_trandate',
													'on', tranDate ] ],
									columns : [ 'custrecord_transactionids' ]
								}).runPaged({
							pageSize : 1000
						});
				var pageCount = pagedData.pageRanges.length;
				for (var i = 0; i < pageCount; i++) {
					pagedData.fetch({
						index : i
					}).data.forEach(function(result, line) {
						var ids = result.getValue(result.columns[0]);
						ids = ids.split(',');
						usedIds = usedIds.concat(ids);
						// log.debug({
						// title : result.recordType
						// });
						return true;
					});
				}
				return usedIds;
			}
			function PrefixInteger(num, length) {
				return (Array(length).join('0') + num).slice(-length);
			}
			function returnFloat(value) {
				var value = Math.round(parseFloat(value) * 100) / 100;
				var xsd = value.toString().split(".");
				if (xsd.length == 1) {
					value = value.toString() + ".00";
					return value;
				}
				if (xsd.length > 1) {
					if (xsd[1].length < 2) {
						value = value.toString() + "0";
					}
					return value;
				}
			}
			// function print() {
			// alert(1);
			// }
			return {
				// print : print,
				fieldChanged : fieldChanged,
				saveRecord : saveRecord
			};
		});