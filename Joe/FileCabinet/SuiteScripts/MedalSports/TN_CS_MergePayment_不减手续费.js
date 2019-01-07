/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @Nauthor Trigger Joe
 * @Nversion 1.0 20180319
 */
define(
		[ 'N/record', 'N/search', 'N/currentRecord', 'N/url', 'N/format',
				'N/currency' ],
		function(record, search, currentRecord, url, format, currencyFmt) {
			var suiteletPage = currentRecord.get();
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
				if (sublistFieldName === 'custrecord_tn_payment_currency') {
					// 自动设置exchangeRate
					var currency = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_currency'
					});
					var rate = currencyFmt.exchangeRate({
						source : currency,
						target : 'USD'
					});
					currentRecord.setValue({
						fieldId : 'custrecord_tn_payment_exrate',
						value : rate
					});
				}
				if (sublistFieldName === 'custrecord_tn_payment_entity'
						|| sublistFieldName === 'custrecord_tn_payment_currency') {
					var entity = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_entity'
					});
					var currency = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_currency'
					});
					var exchangeRate = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_exrate'
					});
					var fromyear = currentRecord.getText({
						fieldId : 'custrecord_tn_fromyear'
					});
					var toyear = currentRecord.getText({
						fieldId : 'custrecord_tn_toyear'
					});
					// alert(entity);
					var vendorId;
					var customerId;
					// alert(entity.type);
					if (entity && currency) {
						// 查找关联entity
						var entSearch = search.create({
							type : search.Type.ENTITY,
							filters : [ [ 'internalid', 'anyof', entity ] ]
						});
						entSearch.run().each(function(result) {
							// alert(result.recordType);
							if (result.recordType == 'customer') {
								var cusRecord = record.load({
									type : record.Type.CUSTOMER,
									id : result.id,
									isDynamic : true
								});
								customerId = entity;
								vendorId = cusRecord.getValue({
									fieldId : 'custentity_tn_customer_vendor'
								});
							} else if (result.recordType == 'vendor') {
								var venRecord = record.load({
									type : record.Type.VENDOR,
									id : result.id,
									isDynamic : true
								});
								vendorId = entity;
								customerId = venRecord.getValue({
									fieldId : 'custentity_tn_vendor_customer'
								});
							} else {
								vendorId = entity;
							}
							return true;
						});
						// 删除现有line
						// ar_invoice
						var invCount = currentRecord.getLineCount({
							sublistId : 'custpage_tn_mergepay_invoice'
						});
						for (var i = 0; i < invCount; i++) {
							currentRecord.removeLine({
								sublistId : 'custpage_tn_mergepay_invoice',
								line : 0
							});
						}
						// ar_credit
						var creCount = currentRecord.getLineCount({
							sublistId : 'custpage_tn_mergepay_credit'
						});
						for (var i = 0; i < creCount; i++) {
							currentRecord.removeLine({
								sublistId : 'custpage_tn_mergepay_credit',
								line : 0
							});
						}
						// ar_deposit
						var creCount = currentRecord.getLineCount({
							sublistId : 'custpage_tn_mergepay_dep'
						});
						for (var i = 0; i < creCount; i++) {
							currentRecord.removeLine({
								sublistId : 'custpage_tn_mergepay_dep',
								line : 0
							});
						}
						// ap
						var apCount = currentRecord.getLineCount({
							sublistId : 'custpage_tn_mergepay_ap'
						});
						for (var i = 0; i < apCount; i++) {
							currentRecord.removeLine({
								sublistId : 'custpage_tn_mergepay_ap',
								line : 0
							});
						}
						// others
						var apCount = currentRecord.getLineCount({
							sublistId : 'custpage_tn_mergepay_ot'
						});
						for (var i = 0; i < apCount; i++) {
							currentRecord.removeLine({
								sublistId : 'custpage_tn_mergepay_ot',
								line : 0
							});
						}
						// 2.1设置invoice sublist
						// alert(currency);
						if (customerId) {
							var invSearch = search
									.create({
										type : search.Type.INVOICE,
										filters : [
												[ 'entity', 'anyof', customerId ],
												'AND',
												[ 'currency', 'anyof', currency ],
												'AND',
												[ 'mainline', 'is', 'T' ] ],
										columns : [ 'trandate', 'tranid',
												'total', 'amountremaining',
												'currency', 'status' ]
									});
							invSearch.run().each(function(result) {
								var status = result.getValue({
									name : 'status'
								});
								if (status != 'open') {
									return true;
								}
								var objRecord = record.load({
									type : record.Type.INVOICE,
									id : result.id
								});
								var total = objRecord.getValue({
									fieldId : 'total'
								});
								var amountRemainingTotal = objRecord.getValue({
									fieldId : 'amountremaining'
								});
								var tranDate = result.getValue({
									name : invSearch.columns[0].name
								});
								var tranId = result.getValue({
									name : invSearch.columns[1].name
								});
								var currency = result.getText({
									name : invSearch.columns[4].name
								});
								// alert(currency);
								// 填充sublist
								var line = currentRecord.selectNewLine({
									sublistId : 'custpage_tn_mergepay_invoice'
								});
								// date
								line.setCurrentSublistValue({
									sublistId : 'custpage_tn_mergepay_invoice',
									fieldId : 'custpage_inv_date',
									value : tranDate,
								});
								// type
								line.setCurrentSublistValue({
									sublistId : 'custpage_tn_mergepay_invoice',
									fieldId : 'custpage_inv_type',
									value : result.id
								});
								// tranId
								line.setCurrentSublistValue({
									sublistId : 'custpage_tn_mergepay_invoice',
									fieldId : 'custpage_inv_refnum',
									value : tranId
								});
								// total
								line.setCurrentSublistValue({
									sublistId : 'custpage_tn_mergepay_invoice',
									fieldId : 'custpage_inv_total',
									value : total
								});
								// amountRemainingTotal
								line.setCurrentSublistValue({
									sublistId : 'custpage_tn_mergepay_invoice',
									fieldId : 'custpage_inv_due',
									value : amountRemainingTotal
								});
								// currency
								line.setCurrentSublistValue({
									sublistId : 'custpage_tn_mergepay_invoice',
									fieldId : 'custpage_inv_currency',
									value : currency
								});
								line.commitLine({
									sublistId : 'custpage_tn_mergepay_invoice'
								});

								return true;
							});
							// 2.2设置credit sublist
							var creSearch = search
									.create({
										type : search.Type.CREDIT_MEMO,
										filters : [
												[ 'entity', 'anyof', customerId ],
												'AND',
												[ 'currency', 'anyof', currency ],
												'AND',
												[ 'mainline', 'is', 'T' ] ],
										columns : [ 'trandate', 'tranid',
												'total', 'amountremaining',
												'currency', 'status' ]
									});
							creSearch.run().each(function(result) {
								var status = result.getValue({
									name : 'status'
								});
								if (status != 'open') {
									return true;
								}
								var objRecord = record.load({
									type : record.Type.CREDIT_MEMO,
									id : result.id
								});
								var total = objRecord.getValue({
									fieldId : 'total'
								});
								var amountRemainingTotal = objRecord.getValue({
									fieldId : 'amountremaining'
								});
								var tranDate = result.getValue({
									name : creSearch.columns[0].name
								});
								var tranId = result.getValue({
									name : creSearch.columns[1].name
								});
								var currency = result.getText({
									name : creSearch.columns[4].name
								});
								// alert(currency);
								// 填充sublist
								var line = currentRecord.selectNewLine({
									sublistId : 'custpage_tn_mergepay_credit'
								});
								// date
								line.setCurrentSublistValue({
									sublistId : 'custpage_tn_mergepay_credit',
									fieldId : 'custpage_cre_date',
									value : tranDate,
								});
								// type
								line.setCurrentSublistValue({
									sublistId : 'custpage_tn_mergepay_credit',
									fieldId : 'custpage_cre_type',
									value : result.id
								});
								// tranId
								line.setCurrentSublistValue({
									sublistId : 'custpage_tn_mergepay_credit',
									fieldId : 'custpage_cre_refnum',
									value : tranId
								});
								// total
								line.setCurrentSublistValue({
									sublistId : 'custpage_tn_mergepay_credit',
									fieldId : 'custpage_cre_total',
									value : total
								});
								// amountRemainingTotal
								line.setCurrentSublistValue({
									sublistId : 'custpage_tn_mergepay_credit',
									fieldId : 'custpage_cre_due',
									value : amountRemainingTotal
								});
								// currency
								line.setCurrentSublistValue({
									sublistId : 'custpage_tn_mergepay_credit',
									fieldId : 'custpage_cre_currency',
									value : currency
								});
								line.commitLine({
									sublistId : 'custpage_tn_mergepay_credit'
								});

								return true;
							});
						}

						// 3.设置AP sublist
						// 得到bill
						// alert(vendorId);
						if (vendorId) {
							var initFilter = [ [ 'entity', 'anyof', vendorId ],
									'AND', [ 'currency', 'anyof', currency ],
									'AND', [ 'mainline', 'is', 'T' ] ];
							var initColums = [ 'trandate', 'tranid', 'total',
									'amountremaining', 'currency', 'status' ];
							// alert(initFilter);
							// 带出VENDOR_BILL
							var billSearch = search.create({
								type : search.Type.VENDOR_BILL,
								filters : initFilter,
								columns : initColums
							});
							setAPSublist(billSearch, currentRecord, record);
							// 得到bill credit
							var billCreSearch = search.create({
								type : search.Type.VENDOR_CREDIT,
								filters : initFilter,
								columns : initColums
							});
							setAPSublist(billCreSearch, currentRecord, record);
						}
						if (!vendorId && !customerId) {
							// 得到EXPENSE_REPORT
							var billCreSearch = search.create({
								type : search.Type.EXPENSE_REPORT,
								filters : initFilter,
								columns : initColums
							});
							setAPSublist(billCreSearch, currentRecord, record);
						}

						// 4.设置otherstab
						if (fromyear && toyear) {
							var initFilterO = [ [ 'entity', 'anyof', entity ] ];
							var yearNum = parseInt(toyear) - parseInt(fromyear);
							var yearBegin = new Date();
							var yearEnd = new Date();
							for (var i = 0; i < yearNum + 1; i++) {
								var year = parseInt(toyear) - i;
								yearBegin.setFullYear(year, 0, 1);
								yearEnd.setFullYear(year, 11, 31);
								var yearBeginV = format.format({
									value : yearBegin,
									type : format.Type.DATE
								});
								var yearEndV = format.format({
									value : yearEnd,
									type : format.Type.DATE
								});
								initFilterO.push('AND', [ 'trandate', 'within',
										yearBeginV, yearEndV ]);
								setOthersTab(search, initFilterO, year,
										currentRecord, exchangeRate);
							}
						}

					}

				}
				var payAmount = currentRecord.getValue({
					fieldId : 'custrecord_tn_payment_amount',
					value : total
				});
				// 设置 bill Credit 全额选中
				if (sublistName === 'custpage_tn_mergepay_ap'
						&& (sublistFieldName === 'custpage_ap_apply' || sublistFieldName === 'custpage_ap_amount')) {
					var type = currentRecord.getCurrentSublistText({
						sublistId : 'custpage_tn_mergepay_ap',
						fieldId : 'custpage_ap_type'
					});

					var apply = currentRecord.getCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_ap',
						fieldId : 'custpage_ap_apply'
					});
					var payment = currentRecord.getCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_ap',
						fieldId : 'custpage_ap_amount'
					});
					var total = currentRecord.getCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_ap',
						fieldId : 'custpage_ap_total'
					});

					if (type.indexOf('Credit') != -1) {
						if (apply) {
							if (payment != total) {
								currentRecord.setCurrentSublistValue({
									sublistId : 'custpage_tn_mergepay_ap',
									fieldId : 'custpage_ap_amount',
									value : total
								});
							}
						}
					}
				}
				// 设置 others tab 数据
				if (sublistFieldName === 'custrecord_tn_fromyear'
						|| sublistFieldName === 'custrecord_tn_toyear') {
					var entity = currentRecord.getText({
						fieldId : 'custrecord_tn_payment_entity'
					});
					var exchangeRate = currentRecord.getText({
						fieldId : 'custrecord_tn_payment_exrate'
					});
					var fromyear = currentRecord.getText({
						fieldId : 'custrecord_tn_fromyear'
					});
					var toyear = currentRecord.getText({
						fieldId : 'custrecord_tn_toyear'
					});
					if (fromyear && toyear) {
						var initFilterO = [ [ 'entity', 'anyof', entity ] ];
						var yearNum = parseInt(toyear) - parseInt(fromyear);
						var yearBegin = new Date();
						var yearEnd = new Date();
						if (yearNum >= 0) {
							// 先删除others
							var apCount = currentRecord.getLineCount({
								sublistId : 'custpage_tn_mergepay_ot'
							});
							for (var i = 0; i < apCount; i++) {
								currentRecord.removeLine({
									sublistId : 'custpage_tn_mergepay_ot',
									line : 0
								});
							}
							for (var i = 0; i < yearNum + 1; i++) {
								var year = parseInt(toyear) - i;
								yearBegin.setFullYear(year, 0, 1);
								yearEnd.setFullYear(year, 11, 31);
								var yearBeginV = format.format({
									value : yearBegin,
									type : format.Type.DATE
								});
								var yearEndV = format.format({
									value : yearEnd,
									type : format.Type.DATE
								});
								// alert(yearBeginV + '|' + yearEndV);
								initFilterO.push('AND', [ 'trandate', 'within',
										yearBeginV, yearEndV ]);
								setOthersTab(search, initFilterO, year,
										currentRecord, exchangeRate);
							}
						}
					}
				}

			}

			function setAPSublist(search, currentRecord, record) {
				search
						.run()
						.each(
								function(result) {
									var status = result.getValue({
										name : 'status'
									});
									if (result.recordType == 'vendorbill'
											&& status != 'open'
											&& status != 'Approved') {
										return true;
									}
									var objRecord = record.load({
										type : result.recordType,
										id : result.id
									});
									var total = objRecord.getValue({
										fieldId : 'total'
									});
									var amtrem = objRecord.getValue({
										fieldId : 'custbody_tn_amtrem'
									});
									var amountRemFeildId;
									if (result.recordType == 'vendorbill') {
										if (amtrem) {
											amountRemFeildId = 'custbody_tn_amtrem';
										} else {
											amountRemFeildId = 'total';
										}
									} else {
										amountRemFeildId = 'unapplied';

									}
									var amountRemainingTotal = objRecord
											.getValue({
												fieldId : amountRemFeildId
											});
									var tranDate = result.getValue({
										name : search.columns[0].name
									});
									var tranId = result.getValue({
										name : search.columns[1].name
									});
									var currency = result.getText({
										name : search.columns[4].name
									});
									// var amountRemainingTotal =
									// result.getValue({
									// name : 'amountremaining'
									// });
									// alert(currency);
									// 填充sublist
									var line = currentRecord.selectNewLine({
										sublistId : 'custpage_tn_mergepay_ap'
									});
									// date
									line.setCurrentSublistValue({
										sublistId : 'custpage_tn_mergepay_ap',
										fieldId : 'custpage_ap_date',
										value : tranDate,
									});
									// type
									line.setCurrentSublistValue({
										sublistId : 'custpage_tn_mergepay_ap',
										fieldId : 'custpage_ap_type',
										value : result.id
									});
									// tranId
									line.setCurrentSublistValue({
										sublistId : 'custpage_tn_mergepay_ap',
										fieldId : 'custpage_ap_refnum',
										value : tranId
									});
									// total
									line.setCurrentSublistValue({
										sublistId : 'custpage_tn_mergepay_ap',
										fieldId : 'custpage_ap_total',
										value : total
									});
									// amountRemainingTotal
									line.setCurrentSublistValue({
										sublistId : 'custpage_tn_mergepay_ap',
										fieldId : 'custpage_ap_due',
										value : amountRemainingTotal
									});
									// currency
									line.setCurrentSublistValue({
										sublistId : 'custpage_tn_mergepay_ap',
										fieldId : 'custpage_ap_currency',
										value : currency
									});
									line.commitLine({
										sublistId : 'custpage_tn_mergepay_ap'
									});

									return true;
								});
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
					var balance = getBalance(currentRecord);
					var paymentAmount = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_amount'
					});
					var entity = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_entity'
					});

					var balanceaccount = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_balanceaccount'
					});

					// 第三步：保存前生成MPNum
					var numPrefix = 'MP-';
					var date = new Date();
					numPrefix += (date.getFullYear() + '').substr(2);
					numPrefix += PrefixInteger((date.getMonth() + 1), 2)
							+ PrefixInteger(date.getDate(), 2);
					// var today = date.getDate() + '/' + (date.getMonth() + 1)
					// + '/' + date.getFullYear();
					var today = format.format({
						value : date,
						type : format.Type.DATE
					});
					var mgSearch = search.create({
						type : 'customrecord_tn_payment',
						filters : [ [ 'created', 'on', today ] ]
					});
					var count = 1;
					mgSearch.run().each(function(result) {
						// alert(count++);
						count++
						return true;
					});
					count = PrefixInteger(count, 3);
					numPrefix += count;
					currentRecord.setValue({
						fieldId : 'custrecord_tn_mp_number',
						value : numPrefix
					});

					//
					// if (balanceaccount == '' || paymentAmount == '') {
					// return true;
					// }
					if (paymentAmount == '') {
						return true;
					}
					var recType;
					// 查找关联entity
					var entSearch = search.create({
						type : search.Type.ENTITY,
						filters : [ [ 'internalid', 'anyof', entity ] ]
					});
					entSearch.run().each(function(result) {
						recType = result.recordType;
						return true;
					});
					if (recType == 'customer') {
						if (paymentAmount > 0) {// 付款
							if (balance < 0) {
								alert('客戶付款時ar要大於ap！');
								return false;
							}
						}
						if (paymentAmount < 0) {// 退款
							if (balance > 0) {
								alert('给客戶退款時ap要大於ar！');
								return false;
							}
						}
					} else {
						if (paymentAmount > 0) {// 付款
							if (balance > 0) {
								alert('给供應商付款時ap要大於ar！');
								return false;
							}
						}
						if (paymentAmount < 0) {// 退款
							if (balance < 0) {
								alert('供應商退款時ar要大於ap！');
								return false;
							}
						}
					}
					var paymentBalance = Math.abs(paymentAmount)
							- Math.abs(balance);
					currentRecord.setValue({
						fieldId : 'custrecord_tn_payment_balance',
						value : paymentBalance
					});
					if (paymentBalance < 0) {
						alert('Payment Balance必須大於0！');
						return false;
					}
					if (paymentBalance > 0 && balanceaccount == '') {
						alert('Account不能為空！');
						return false;
					}

					return true;
				} catch (e) {
					alert(e);
				}
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

			// 打印合并付款入口
			function print() {
				// alert(mpPrintURL);
				var startDate = suiteletPage.getValue({
					fieldId : 'custpage_startdate'
				});
				var endDate = suiteletPage.getValue({
					fieldId : 'custpage_enddate'
				});
				// startDate = startDate.getDate() + '/'
				// + (startDate.getMonth() + 1) + '/'
				// + startDate.getFullYear();
				startDate = format.format({
					value : startDate,
					type : format.Type.DATE
				});
				// endDate = endDate.getDate() + '/' + (endDate.getMonth() + 1)
				// + '/' + endDate.getFullYear();
				endDate = format.format({
					value : endDate,
					type : format.Type.DATE
				});
				var mpPrintURL = url.resolveScript({
					scriptId : 'customscript_tn_sl_printmp',
					deploymentId : 'customdeploy_tn_sl_printmp',
					params : {
						startDate : startDate,
						endDate : endDate
					}
				});
				window.open(mpPrintURL);
			}

			function getBalance(currentRecord) {
				// 保存前判断并设置balance
				var invNum = currentRecord.getLineCount({
					sublistId : 'custpage_tn_mergepay_invoice'
				});
				var creNum = currentRecord.getLineCount({
					sublistId : 'custpage_tn_mergepay_credit'
				});
				var apNum = currentRecord.getLineCount({
					sublistId : 'custpage_tn_mergepay_ap'
				});
				var otNum = currentRecord.getLineCount({
					sublistId : 'custpage_tn_mergepay_ot'
				});
				var npNum = currentRecord.getLineCount({
					sublistId : 'custpage_tn_mergepay_np'
				});
				var debitAmount = 0;
				var creditAmount = 0;
				// ar
				for (var i = 0; i < invNum; i++) {
					var apply = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_invoice',
						fieldId : 'custpage_inv_apply',
						line : i
					});
					var payment = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_invoice',
						fieldId : 'custpage_inv_amount',
						line : i
					});
					if (apply && payment) {
						debitAmount += payment;
					}
				}
				for (var i = 0; i < creNum; i++) {
					var apply = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_credit',
						fieldId : 'custpage_cre_apply',
						line : i
					});
					var payment = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_credit',
						fieldId : 'custpage_cre_amount',
						line : i
					});
					if (apply && payment) {
						creditAmount += payment;
					}
				}

				// ap
				for (var i = 0; i < apNum; i++) {
					var apply = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_ap',
						fieldId : 'custpage_ap_apply',
						line : i
					});
					var payment = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_ap',
						fieldId : 'custpage_ap_amount',
						line : i
					});
					var tranName = currentRecord.getSublistText({
						sublistId : 'custpage_tn_mergepay_ap',
						fieldId : 'custpage_ap_type',
						line : i
					});
					// alert(type);
					if (apply && payment) {
						if (tranName.indexOf('Credit') == -1) {
							creditAmount += payment;
						} else {
							debitAmount += payment;
						}
					}
				}

				// 其他
				for (var i = 0; i < otNum; i++) {
					var apply = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_ot',
						fieldId : 'custpage_ot_apply',
						line : i
					});
					var payment = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_ot',
						fieldId : 'custpage_ot_payment',
						line : i
					});

					var balancecurr = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_ot',
						fieldId : 'custpage_ot_balancecurr',
						line : i
					});
					if (apply && balancecurr) {
						if (balancecurr > 0) {
							debitAmount += payment;
						} else if (balancecurr < 0) {
							creditAmount += payment;
						}
					}
				}

				// 未立項
				var tmpDebitAmt = 0;
				var tmpCreditAmt = 0;
				for (var i = 0; i < npNum; i++) {
					var debit = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_np',
						fieldId : 'custpage_np_debit',
						line : i
					});
					var credit = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_np',
						fieldId : 'custpage_np_credit',
						line : i
					});
					tmpDebitAmt += debit;
					tmpCreditAmt += credit;
				}
				var tmpBalance = tmpDebitAmt - tmpCreditAmt;
				if (tmpBalance > 0) {
					creditAmount += tmpBalance;
				} else if (tmpBalance < 0) {
					debitAmount += tmpBalance;
				}
				var payAmount = currentRecord.getValue({
					fieldId : 'custrecord_tn_payment_amount'
				});
				var exrate = currentRecord.getValue({
					fieldId : 'custrecord_tn_payment_exrate'
				});
				// var bankAmount = (payAmount - tmpBalance) * exrate;
				var bankAmount = payAmount * exrate;
				currentRecord.setValue({
					fieldId : 'custrecord_tn_bankamount',
					value : bankAmount
				});
				// 開始計算
				var balance = debitAmount - creditAmount;
				return balance;
			}

			function setOthersTab(search, initFilter, year, currentRecord,
					exchangeRate) {
				var otherSearch = search.load({
					id : 'customsearch_mp_others'
				});
				otherSearch.filterExpression = otherSearch.filterExpression
						.concat([ 'AND', initFilter ]);
				var lineOtYear = currentRecord.selectNewLine({
					sublistId : 'custpage_tn_mergepay_ot'
				});
				lineOtYear.setCurrentSublistValue({
					sublistId : 'custpage_tn_mergepay_ot',
					fieldId : 'custpage_ot_year',
					value : year,
				});
				lineOtYear.commitLine({
					sublistId : 'custpage_tn_mergepay_ot'
				});
				otherSearch.run().each(function(result) {
					var account = result.getValue(result.columns[0]);
					var debit = result.getValue(result.columns[1]);
					var credit = result.getValue(result.columns[2]);
					var currency = result.getValue(result.columns[3]);
					// console.log(debit);
					// console.log(credit);
					// if (debit == null && credit == null) {
					// return true;
					// }
					// var excRate = result.getValue(result.columns[4]);
					var excRate = currencyFmt.exchangeRate({
						source : currency,
						target : 'USD'
					});
					var balanceBase = debit - credit;
					var balance = balanceBase / excRate;
					var balanceCurr = balanceBase / exchangeRate;
					if (balanceBase == 0) {
						return true;
					}
					// 填充sublist
					var lineOt = currentRecord.selectNewLine({
						sublistId : 'custpage_tn_mergepay_ot'
					});
					lineOt.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_ot',
						fieldId : 'custpage_ot_account',
						value : account,
					});
					lineOt.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_ot',
						fieldId : 'custpage_ot_currency',
						value : currency
					});
					lineOt.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_ot',
						fieldId : 'custpage_ot_balance',
						value : balance
					});
					lineOt.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_ot',
						fieldId : 'custpage_ot_balancebase',
						value : balanceBase
					});
					lineOt.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_ot',
						fieldId : 'custpage_ot_balancecurr',
						value : balanceCurr
					});
					lineOt.commitLine({
						sublistId : 'custpage_tn_mergepay_ot'
					});
					return true;
				});
			}
			return {
				print : print,
				fieldChanged : fieldChanged,
				saveRecord : saveRecord
			};
		});