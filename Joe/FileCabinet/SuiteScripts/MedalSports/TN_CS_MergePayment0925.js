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
				// �ڶ�����ɸѡ�����sublist
				var currentRecord = context.currentRecord;
				var sublistName = context.sublistId;
				var sublistFieldName = context.fieldId;
				if (sublistFieldName === 'custrecord_tn_payment_currency') {
					// �Զ�����exchangeRate
					var currency = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_currency'
					});
					if (currency) {
						var rate = currencyFmt.exchangeRate({
							source : currency,
							target : 'USD'
						});
						currentRecord.setValue({
							fieldId : 'custrecord_tn_payment_exrate',
							value : rate
						});
					}
				}
				if (sublistFieldName === 'custrecord_tn_payment_entity'
						|| sublistFieldName === 'custrecord_tn_payment_currency'
						|| sublistFieldName === 'custrecord_tn_payment_bankaccount') {
					var entity = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_entity'
					});
					var bankAccount = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_bankaccount'
					});
					// var bankCurrency = currentRecord.getValue({
					// fieldId : 'custrecord_tn_payment_currency'
					// });
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
					// alert(bankAccount);
					// if (entity) {
					if (entity && currency && bankAccount) {
						var banAccRec = record.load({
							type : record.Type.ACCOUNT,
							id : bankAccount
						});
						var bankCurrency = banAccRec.getValue({
							fieldId : 'currency'
						});
						// ���ҹ���entity
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
						// ɾ������line
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
						// 2.1����invoice sublist
						// alert(currency);
						if (customerId && currency) {

							// ����invoice sublist
							var initFilterInv = [
									[ 'entity', 'anyof', customerId ], 'AND',
									[ 'mainline', 'is', 'T' ], 'AND',
									[ 'amount', 'greaterthan', '0' ] ];
							if (currency != bankCurrency && currency != '1') {
								initFilterInv.push('AND', [ 'currency',
										'anyof', [ currency, '1' ] ]);
							} else {
								initFilterInv.push('AND', [ 'currency',
										'anyof', currency ]);
							}
							var searchIdInv = 'customsearch_mergepaymentinv';
							setInvSublist(searchIdInv, search, initFilterInv,
									currentRecord);
							var searchIdJeAr = 'customsearch_tn_mergepayment_jear';
							setInvSublist(searchIdJeAr, search, initFilterInv,
									currentRecord);

							// ����credit sublist
							var initFilterCre = [
									[ 'entity', 'anyof', customerId ], 'AND',
									[ 'mainline', 'is', 'T' ], 'AND',
									[ 'amount', 'lessthan', '0' ] ];
							if (currency != bankCurrency && currency != '1') {
								initFilterCre.push('AND', [ 'currency',
										'anyof', [ currency, '1' ] ]);
							} else {
								initFilterCre.push('AND', [ 'currency',
										'anyof', currency ]);
							}
							var searchIdCre = 'customsearch_mergepaymentcre';
							setCreSublist(searchIdCre, search, initFilterCre,
									currentRecord);
							setCreSublist(searchIdJeAr, search, initFilterCre,
									currentRecord);
						}

						// 3.����AP sublist
						// �õ�bill
						// alert(vendorId);
						// 'AND', [ 'currency', 'anyof', currency ],
						if (vendorId && currency && bankCurrency) {
							var initFilter = [ [ 'entity', 'anyof', vendorId ],
									'AND', [ 'mainline', 'is', 'T' ] ];
							if (currency != bankCurrency && currency != '1') {
								initFilter.push('AND', [ 'currency', 'anyof',
										[ currency, '1' ] ]);
							} else {
								initFilter.push('AND', [ 'currency', 'anyof',
										currency ]);
							}
							// ����bill��billCredit
							var searchIdBill = 'customsearch_tn_mergepayment_bill';
							setAPSublist(searchIdBill, search, initFilter,
									currentRecord);
							// ����JE

							var searchIdJE = 'customsearch_tn_mergepayment_jeap';
							setAPSublist(searchIdJE, search, initFilter,
									currentRecord);
						}
						if (!vendorId && !customerId) {
							// �õ�EXPENSE_REPORT
							var billCreSearch = search.create({
								type : search.Type.EXPENSE_REPORT,
								filters : initFilter,
								columns : initColums
							});
							setAPSublist(billCreSearch, currentRecord, record);
						}

						// 4.����otherstab
						if (fromyear && toyear) {
							var entity = currentRecord.getValue({
								fieldId : 'custrecord_tn_payment_entity'
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
							var bankCurrency = currentRecord.getValue({
								fieldId : 'custrecord_tn_bankcurrency'
							});
							var currency = currentRecord.getValue({
								fieldId : 'custrecord_tn_payment_currency'
							});
							// alert(fromyear + '|' + toyear);
							if (fromyear && toyear) {
								var yearNum = parseInt(toyear)
										- parseInt(fromyear);
								if (yearNum < 0) {
									return;
								}
								// ��ʼ���ڣ�Ϊ���жϵ����ж���account��ֵ
								var yearFrom = new Date();
								var yearTo = new Date();
								yearFrom.setFullYear(fromyear, 0, 1);
								yearTo.setFullYear(toyear, 11, 31);
								var yearFromV = format.format({
									value : yearFrom,
									type : format.Type.DATE
								});
								var yearToV = format.format({
									value : yearTo,
									type : format.Type.DATE
								});
								var accounts = [];
								// alert(fromyear);
								var otherSearch = search.load({
									id : 'customsearch_mp_others'
								});
								var yearFilter = [
										[ 'entity', 'anyof', entity ],
										'AND',
										[ 'trandate', 'within', yearFromV,
												yearToV ] ];
								if (currency != bankCurrency && currency != '1') {
									yearFilter.push('AND', [ 'currency',
											'anyof', [ currency, '1' ] ]);
								} else {
									yearFilter.push('AND', [ 'currency',
											'anyof', currency ]);
								}
								otherSearch.filterExpression = otherSearch.filterExpression
										.concat([ 'AND', yearFilter ]);
								// alert(otherSearch.filterExpression);
								otherSearch
										.run()
										.each(
												function(result) {
													var account = result
															.getValue(result.columns[0]);
													if (accounts
															.indexOf(account) == -1) {
														accounts.push(account);
													}
													return true;
												});
								// ��ɾ��others
								var apCount = currentRecord.getLineCount({
									sublistId : 'custpage_tn_mergepay_ot'
								});
								for (var i = 0; i < apCount; i++) {
									currentRecord.removeLine({
										sublistId : 'custpage_tn_mergepay_ot',
										line : 0
									});
								}

								// ��ѯ��ʼ���ȸ���ÿ��account �ٸ���ÿ�����
								for (var i = 0; i < accounts.length; i++) {
									var account = accounts[i];
									for (var j = 0; j < yearNum + 1; j++) {
										var initFilterO = [ [ 'entity',
												'anyof', entity ] ];
										var year = parseInt(toyear) - j;
										var yearBegin = new Date();
										var yearEnd = new Date();
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
										// alert(account);
										initFilterO.push('AND',
												[ 'trandate', 'within',
														yearBeginV, yearEndV ]);
										initFilterO.push('AND', [ 'account',
												'anyof', account ]);
										if (currency != bankCurrency
												&& currency != '1') {
											initFilterO.push('AND', [
													'currency', 'anyof',
													[ currency, '1' ] ]);
										} else {
											initFilterO.push('AND', [
													'currency', 'anyof',
													currency ]);
										}
										var lineOtYear = currentRecord
												.selectNewLine({
													sublistId : 'custpage_tn_mergepay_ot'
												});
										lineOtYear
												.setCurrentSublistValue({
													sublistId : 'custpage_tn_mergepay_ot',
													fieldId : 'custpage_ot_account',
													value : account,
												});
										lineOtYear
												.commitLine({
													sublistId : 'custpage_tn_mergepay_ot'
												});
										setOthersTab(entity, search,
												initFilterO, year,
												currentRecord, exchangeRate);
									}
								}

							}

						}

					}

				}
				var payAmount = currentRecord.getValue({
					fieldId : 'custrecord_tn_payment_amount',
					value : total
				});
				// ���� others tab ����
				if (sublistFieldName === 'custrecord_tn_fromyear'
						|| sublistFieldName === 'custrecord_tn_toyear') {
					var entity = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_entity'
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
					var bankCurrency = currentRecord.getValue({
						fieldId : 'custrecord_tn_bankcurrency'
					});
					var currency = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_currency'
					});
					// alert(fromyear + '|' + toyear);
					if (fromyear && toyear) {
						var yearNum = parseInt(toyear) - parseInt(fromyear);
						if (yearNum < 0) {
							return;
						}
						// ��ʼ���ڣ�Ϊ���жϵ����ж���account��ֵ
						var yearFrom = new Date();
						var yearTo = new Date();
						yearFrom.setFullYear(fromyear, 0, 1);
						yearTo.setFullYear(toyear, 11, 31);
						var yearFromV = format.format({
							value : yearFrom,
							type : format.Type.DATE
						});
						var yearToV = format.format({
							value : yearTo,
							type : format.Type.DATE
						});
						var accounts = [];
						// alert(fromyear);
						var otherSearch = search.load({
							id : 'customsearch_mp_others'
						});
						var yearFilter = [ [ 'entity', 'anyof', entity ],
								'AND',
								[ 'trandate', 'within', yearFromV, yearToV ] ];
						if (currency != bankCurrency && currency != '1') {
							yearFilter.push('AND', [ 'currency', 'anyof',
									[ currency, '1' ] ]);
						} else {
							yearFilter.push('AND', [ 'currency', 'anyof',
									currency ]);
						}
						otherSearch.filterExpression = otherSearch.filterExpression
								.concat([ 'AND', yearFilter ]);
						// alert(otherSearch.filterExpression);
						otherSearch.run().each(function(result) {
							var account = result.getValue(result.columns[0]);
							if (accounts.indexOf(account) == -1) {
								accounts.push(account);
							}
							return true;
						});
						// ��ɾ��others
						var apCount = currentRecord.getLineCount({
							sublistId : 'custpage_tn_mergepay_ot'
						});
						for (var i = 0; i < apCount; i++) {
							currentRecord.removeLine({
								sublistId : 'custpage_tn_mergepay_ot',
								line : 0
							});
						}

						// ��ѯ��ʼ���ȸ���ÿ��account �ٸ���ÿ�����
						for (var i = 0; i < accounts.length; i++) {
							var account = accounts[i];
							for (var j = 0; j < yearNum + 1; j++) {
								var initFilterO = [ [ 'entity', 'anyof', entity ] ];
								var year = parseInt(toyear) - j;
								var yearBegin = new Date();
								var yearEnd = new Date();
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
								// alert(account);
								initFilterO.push('AND', [ 'trandate', 'within',
										yearBeginV, yearEndV ]);
								initFilterO.push('AND', [ 'account', 'anyof',
										account ]);
								if (currency != bankCurrency && currency != '1') {
									initFilterO.push('AND', [ 'currency',
											'anyof', [ currency, '1' ] ]);
								} else {
									initFilterO.push('AND', [ 'currency',
											'anyof', currency ]);
								}
								var lineOtYear = currentRecord.selectNewLine({
									sublistId : 'custpage_tn_mergepay_ot'
								});
								lineOtYear.setCurrentSublistValue({
									sublistId : 'custpage_tn_mergepay_ot',
									fieldId : 'custpage_ot_account',
									value : account,
								});
								lineOtYear.commitLine({
									sublistId : 'custpage_tn_mergepay_ot'
								});
								setOthersTab(entity, search, initFilterO, year,
										currentRecord, exchangeRate);
							}
						}

					}
				}
				// ����ARѡ�м�baseamount
				if (sublistName === 'custpage_tn_mergepay_invoice'
						&& sublistFieldName === 'custpage_inv_amount') {
					var currency = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_currency'
					});
					var exchangeRate = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_exrate'
					});
					var bankcurrency = currentRecord.getValue({
						fieldId : 'custrecord_tn_bankcurrency'
					});
					var apply = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custpage_inv_apply'
					});
					var amount = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custpage_inv_amount'
					});
					var currencyLine = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custpage_inv_currency'
					});
					if (!apply && amount) {
						// alert(1);
						currentRecord.setCurrentSublistValue({
							sublistId : sublistName,
							fieldId : 'custpage_inv_apply',
							value : true
						});
					}
					if (amount && exchangeRate) {
						var amtBase = amount;
						if (bankcurrency) {
							if (currencyLine != bankcurrency) {
								amtBase = amount * exchangeRate;
							}
						} else {
							if (currencyLine != currency) {
								amtBase = amount / exchangeRate;
							}
						}
						currentRecord.setCurrentSublistValue({
							sublistId : sublistName,
							fieldId : 'custpage_inv_amountbase',
							value : amtBase
						});
					}
				}
				if (sublistName === 'custpage_tn_mergepay_credit'
						&& sublistFieldName === 'custpage_cre_amount') {
					var currency = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_currency'
					});
					var exchangeRate = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_exrate'
					});
					var bankcurrency = currentRecord.getValue({
						fieldId : 'custrecord_tn_bankcurrency'
					});
					var apply = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custpage_cre_apply'
					});
					var amount = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custpage_cre_amount'
					});
					var currencyLine = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custpage_cre_currency'
					});
					if (!apply && amount) {
						// alert(1);
						currentRecord.setCurrentSublistValue({
							sublistId : sublistName,
							fieldId : 'custpage_cre_apply',
							value : true
						});
					}
					if (amount && exchangeRate) {
						var amtBase = amount;
						if (bankcurrency) {
							if (currencyLine != bankcurrency) {
								amtBase = amount * exchangeRate;
							}
						} else {
							if (currencyLine != currency) {
								amtBase = amount / exchangeRate;
							}
						}
						currentRecord.setCurrentSublistValue({
							sublistId : sublistName,
							fieldId : 'custpage_cre_amountbase',
							value : amtBase
						});
					}
				}

				// ����apѡ�м�baseamount
				if (sublistName === 'custpage_tn_mergepay_ap'
						&& sublistFieldName === 'custpage_ap_amount') {
					var exchangeRate = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_exrate'
					});
					var bankcurrency = currentRecord.getValue({
						fieldId : 'custrecord_tn_bankcurrency'
					});
					var apply = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custpage_ap_apply'
					});
					var total = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custpage_ap_total'
					});
					var amount = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custpage_ap_amount'
					});
					var currencyLine = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custpage_ap_currency'
					});
					if (!apply && amount) {
						// alert(1);
						if (total > 0) {
							currentRecord.setCurrentSublistValue({
								sublistId : sublistName,
								fieldId : 'custpage_ap_apply',
								value : true
							});
						} else {
							if (total != amount) {
								currentRecord.setCurrentSublistValue({
									sublistId : sublistName,
									fieldId : 'custpage_ap_amount',
									value : 0
								});
								currentRecord.setCurrentSublistValue({
									sublistId : sublistName,
									fieldId : 'custpage_ap_apply',
									value : false
								});
							} else {
								currentRecord.setCurrentSublistValue({
									sublistId : sublistName,
									fieldId : 'custpage_ap_apply',
									value : true
								});
							}
						}
					}
					if (amount && exchangeRate) {
						var amtBase = amount;
						if (bankcurrency && currencyLine != bankcurrency) {
							amtBase = amount * exchangeRate;
						}
						if (total > 0) {
							currentRecord.setCurrentSublistValue({
								sublistId : sublistName,
								fieldId : 'custpage_ap_amountbase',
								value : amtBase
							});
						} else {
							if (total != amount) {
								currentRecord.setCurrentSublistValue({
									sublistId : sublistName,
									fieldId : 'custpage_ap_amountbase',
									value : 0
								});
							} else {
								currentRecord.setCurrentSublistValue({
									sublistId : sublistName,
									fieldId : 'custpage_ap_amountbase',
									value : amtBase
								});
							}
						}
					}
				}
				// ����othersѡ�м�baseamount
				if (sublistName === 'custpage_tn_mergepay_ot'
						&& sublistFieldName === 'custpage_ot_amount') {
					var exchangeRate = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_exrate'
					});
					var bankcurrency = currentRecord.getValue({
						fieldId : 'custrecord_tn_bankcurrency'
					});
					var currencyLine = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custpage_ot_currency'
					});
					var apply = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custpage_ot_apply'
					});
					var amount = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custpage_ot_amount'
					});
					if (!apply && amount) {
						// alert(1);
						currentRecord.setCurrentSublistValue({
							sublistId : sublistName,
							fieldId : 'custpage_ot_apply',
							value : true
						});
					}
					if (amount && exchangeRate) {
						var amtBase = amount;
						if (bankcurrency && currencyLine != bankcurrency) {
							amtBase = amount * exchangeRate;
						}
						currentRecord.setCurrentSublistValue({
							sublistId : sublistName,
							fieldId : 'custpage_ot_amountbase',
							value : amtBase
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
				try {
					var currentRecord = context.currentRecord;
					var number = currentRecord.getValue({
						fieldId : 'custrecord_tn_mp_number'
					});
					if (number == '' || number == null) {
						// alert('�벻Ҫ�޸ĺϲ���Ʊ��');
						// return false
						// ������������ǰ����MPNum
						var numPrefix = 'MP-';
						var date = currentRecord.getValue({
							fieldId : 'custrecord_tn_payment_date'
						});
						// var date = new Date();
						numPrefix += (date.getFullYear() + '').substr(2);
						numPrefix += PrefixInteger((date.getMonth() + 1), 2)
								+ PrefixInteger(date.getDate(), 2);
						// var today = date.getDate() + '/' + (date.getMonth() +
						// 1)
						// + '/' + date.getFullYear();
						var today = format.format({
							value : date,
							type : format.Type.DATE
						});
						var mgSearch = search.create({
							type : 'customrecord_tn_payment',
							filters : [ [ 'custrecord_tn_payment_date', 'on',
									today ] ],
							columns : [ 'custrecord_tn_mp_number' ]
						});
						var maxNum;
						mgSearch.run().each(function(result) {
							// alert(maxNum);
							maxNum = result.getValue({
								name : 'custrecord_tn_mp_number'
							});
							return true;
						});
						if (maxNum) {
							maxNum = maxNum.substr(maxNum.length - 3);
							if (maxNum.substring(0, 1) == '0') {
								maxNum = parseInt(maxNum.substr(1)) + 1;
							} else {
								maxNum = parseInt(maxNum) + 1;
							}
							maxNum = PrefixInteger(maxNum, 3);
						} else {
							maxNum = '001';
						}
						numPrefix += maxNum;
						currentRecord.setValue({
							fieldId : 'custrecord_tn_mp_number',
							value : numPrefix
						});
					}
					// else {
					// alert('�벻Ҫ�޸ĺϲ���Ʊ��');
					// return false
					// }
					currentRecord.setValue({
						fieldId : 'name',
						value : number
					});
					// ����sublist balance
					var balance = getBalance(currentRecord);

					var paymentAmount = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_amount'
					});
					var exrate = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_exrate'
					});
					var bankCurrency = currentRecord.getValue({
						fieldId : 'custrecord_tn_bankcurrency'
					});
					var currency = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_currency'
					});
					// alert(balance);
					var entity = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_entity'
					});

					var balanceaccount = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_balanceaccount'
					});
					// ����bankamount
					var bankAmount = paymentAmount ? paymentAmount : balance;
					bankAmount = balance > 0 ? Math.abs(bankAmount) : Math
							.abs(bankAmount)
							* -1;
					currentRecord.setValue({
						fieldId : 'custrecord_tn_bankamountf',
						value : bankAmount
					});
					// alert(bankAmount);
					if (bankCurrency) {
						if (bankCurrency != '1') {
							bankAmount = bankAmount * exrate;
						}
					} else {
						if (currency != '1') {
							bankAmount = bankAmount * exrate;
						}
					}
					currentRecord.setValue({
						fieldId : 'custrecord_tn_bankamount',
						value : bankAmount
					});
					if (paymentAmount == '') {
						return true;
					}

					var recType;
					// ���ҹ���entity
					var entSearch = search.create({
						type : search.Type.ENTITY,
						filters : [ [ 'internalid', 'anyof', entity ] ]
					});
					entSearch.run().each(function(result) {
						recType = result.recordType;
						return true;
					});
					if (recType == 'customer') {
						if (paymentAmount > 0) {// ����
							if (balance < 0) {
								alert('�͑�����rarҪ���ap��');
								return false;
							}
						}
						if (paymentAmount < 0) {// �˿�
							if (balance > 0) {
								alert('���͑��˿�rapҪ���ar��');
								return false;
							}
						}
					} else {
						if (paymentAmount > 0) {// ����
							if (balance > 0) {
								alert('�������̸���rapҪ���ar��');
								return false;
							}
						}
						if (paymentAmount < 0) {// �˿�
							if (balance < 0) {
								alert('�������˿�rarҪ���ap��');
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
						alert('Payment Balance��횴��0��');
						return false;
					}
					if (paymentBalance > 0 && balance != 0
							&& balanceaccount == '') {
						alert('Banlance Account���ܞ�գ�');
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

			// ��ӡ�ϲ��������
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
				// ����ǰ�жϲ�����balance
				var currencyCur = currentRecord.getValue({
					fieldId : 'custrecord_tn_payment_currency'
				});
				var bankCurrency = currentRecord.getValue({
					fieldId : 'custrecord_tn_bankcurrency'
				});
				var exchangeRate = currentRecord.getValue({
					fieldId : 'custrecord_tn_payment_exrate'
				});
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
				// AR
				// invoice
				// ��ѯ�м���currency
				var currencys = [];
				// �Ȳ�ѯ�м���currency
				for (var i = 0; i < invNum; i++) {
					var currency = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_invoice',
						fieldId : 'custpage_inv_currency',
						line : i
					});
					var isSelect = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_invoice',
						fieldId : 'custpage_inv_apply',
						line : i
					});
					var arAccount = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_invoice',
						fieldId : 'custpage_inv_araccount',
						line : i
					});
					var curAcc = currency + ',' + arAccount;
					if (currencys.indexOf(curAcc) == '-1' && isSelect) {
						currencys.push(curAcc);
					}
				}
				// alert(currencys);
				for (var i = 0; i < currencys.length; i++) {
					var currency = currencys[i].split(',')[0];
					var arAccount = currencys[i].split(',')[1];
					var invSum = 0;
					for (var j = 0; j < invNum; j++) {
						var isSelect = currentRecord.getSublistValue({
							sublistId : 'custpage_tn_mergepay_invoice',
							fieldId : 'custpage_inv_apply',
							line : j
						});
						var payment = currentRecord.getSublistValue({
							sublistId : 'custpage_tn_mergepay_invoice',
							fieldId : 'custpage_inv_amount',
							line : j
						});
						var currencyL = currentRecord.getSublistValue({
							sublistId : 'custpage_tn_mergepay_invoice',
							fieldId : 'custpage_inv_currency',
							line : j
						});
						var arAccountL = currentRecord.getSublistValue({
							sublistId : 'custpage_tn_mergepay_invoice',
							fieldId : 'custpage_inv_araccount',
							line : j
						});
						if (isSelect && payment && currencyL == currency
								&& arAccountL == arAccount) {
							invSum += payment;
							// alert(arNum);
						}
					}
					// var amtBase = arNum;
					if (bankCurrency) {
						if (currency != bankCurrency) {
							invSum = invSum * exchangeRate;
						}
					} else {
						if (currency != currencyCur) {
							invSum = invSum / exchangeRate;
						}
					}
					invSum = parseFloat(invSum.toFixed(2));
					// alert(arNum);
					debitAmount += invSum;
				}
				// alert(debitAmount);
				// creditMemo
				// ��ѯ�м���currency
				var currencysCre = [];
				for (var i = 0; i < creNum; i++) {
					var currency = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_credit',
						fieldId : 'custpage_cre_currency',
						line : i
					});
					var isSelect = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_credit',
						fieldId : 'custpage_cre_apply',
						line : i
					});
					var arAccount = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_credit',
						fieldId : 'custpage_cre_araccount',
						line : i
					});
					var curAcc = currency + ',' + arAccount;
					if (currencysCre.indexOf(curAcc) == '-1' && isSelect) {
						currencysCre.push(curAcc);
					}
				}
				// alert(currencys);
				for (var i = 0; i < currencysCre.length; i++) {
					var currency = currencysCre[i].split(',')[0];
					var arAccount = currencysCre[i].split(',')[1];
					var creSum = 0;
					for (var j = 0; j < creNum; j++) {
						var isSelect = currentRecord.getSublistValue({
							sublistId : 'custpage_tn_mergepay_credit',
							fieldId : 'custpage_cre_apply',
							line : j
						});
						var payment = currentRecord.getSublistValue({
							sublistId : 'custpage_tn_mergepay_credit',
							fieldId : 'custpage_cre_amount',
							line : j
						});
						var currencyL = currentRecord.getSublistValue({
							sublistId : 'custpage_tn_mergepay_credit',
							fieldId : 'custpage_cre_currency',
							line : j
						});
						var arAccountL = currentRecord.getSublistValue({
							sublistId : 'custpage_tn_mergepay_credit',
							fieldId : 'custpage_cre_araccount',
							line : j
						});
						if (isSelect && payment && currencyL == currency
								&& arAccountL == arAccount) {
							creSum += payment;
						}
					}
					// var amtBase = arNum;
					if (bankCurrency) {
						if (currency != bankCurrency) {
							creSum = creSum * exchangeRate;
						}
					} else {
						if (currency != currencyCur) {
							creSum = creSum / exchangeRate;
						}
					}
					creSum = parseFloat(creSum.toFixed(2));
					creditAmount += creSum;
				}
				// alert('creditAmount' + creditAmount);
				// AP
				// ��ѯ�м���currency
				var currencysAp = [];
				for (var i = 0; i < apNum; i++) {
					var currency = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_ap',
						fieldId : 'custpage_ap_currency',
						line : i
					});
					var isSelect = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_ap',
						fieldId : 'custpage_ap_apply',
						line : i
					});
					var apAccount = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_ap',
						fieldId : 'custpage_ap_apaccount',
						line : i
					});
					var curAcc = currency + ',' + apAccount;
					if (currencysAp.indexOf(curAcc) == '-1' && isSelect) {
						currencysAp.push(curAcc);
					}
				}
				// alert(currencysAp);
				for (var i = 0; i < currencysAp.length; i++) {
					var currency = currencysAp[i].split(',')[0];
					var apAccount = currencysAp[i].split(',')[1];
					var apSum = 0;
					for (var j = 0; j < apNum; j++) {
						var isSelect = currentRecord.getSublistValue({
							sublistId : 'custpage_tn_mergepay_ap',
							fieldId : 'custpage_ap_apply',
							line : j
						});
						var payment = currentRecord.getSublistValue({
							sublistId : 'custpage_tn_mergepay_ap',
							fieldId : 'custpage_ap_amount',
							line : j
						});
						var currencyL = currentRecord.getSublistValue({
							sublistId : 'custpage_tn_mergepay_ap',
							fieldId : 'custpage_ap_currency',
							line : j
						});
						var apAccountL = currentRecord.getSublistValue({
							sublistId : 'custpage_tn_mergepay_ap',
							fieldId : 'custpage_ap_apaccount',
							line : j
						});
						var total = currentRecord.getSublistValue({
							sublistId : 'custpage_tn_mergepay_ap',
							fieldId : 'custpage_ap_total',
							line : j
						});
						// alert('apSumL:' + apSum);
						if (isSelect && payment && currencyL == currency
								&& apAccountL == apAccount) {
							// alert('total:' + total + ',payment:' + payment);
							if (total > 0) {
								apSum += payment;
							} else {
								apSum -= payment;
							}
						}
					}
					// alert('apSum:' + apSum);
					// var amtBase = arNum;
					if (bankCurrency) {
						if (currency != bankCurrency) {
							apSum = apSum * exchangeRate;
						}
					} else {
						if (currency != currencyCur) {
							apSum = apSum / exchangeRate;
						}
					}
					apSum = parseFloat(apSum.toFixed(2));
					creditAmount += apSum;
				}
				// alert('creditAmount:' + creditAmount);
				// ����
				for (var i = 0; i < otNum; i++) {
					var apply = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_ot',
						fieldId : 'custpage_ot_apply',
						line : i
					});
					var paymentBase = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_ot',
						fieldId : 'custpage_ot_amountbase',
						line : i
					});
					var balance = currentRecord.getSublistValue({
						sublistId : 'custpage_tn_mergepay_ot',
						fieldId : 'custpage_ot_balance',
						line : i
					});
					if (apply && paymentBase) {
						if (balance > 0) {
							debitAmount += paymentBase;
						} else if (balance < 0) {
							creditAmount += paymentBase;
						}
					}
				}

				// δ���
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
					if (!debit) {
						debit = 0;
					}
					if (!credit) {
						credit = 0;
					}
					tmpDebitAmt += debit;
					tmpCreditAmt += credit;
				}
				// alert(tmpDebitAmt + '' + tmpCreditAmt);
				var tmpBalance = tmpDebitAmt - tmpCreditAmt;
				if (tmpBalance > 0) {
					creditAmount += tmpBalance;
				} else if (tmpBalance < 0) {
					debitAmount -= tmpBalance;
				}
				// alert(debitAmount);
				// alert(creditAmount);
				// �_ʼӋ��
				var balance = debitAmount - creditAmount;
				return balance;
			}

			function setOthersTab(entity, search, initFilter, year,
					currentRecord, exchangeRate) {
				var otherSearch = search.load({
					id : 'customsearch_mp_others'
				});
				otherSearch.filterExpression = otherSearch.filterExpression
						.concat([ 'AND', initFilter ]);
				// console.log(otherSearch.filterExpression);
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
					var currency = result.getValue(result.columns[1]);
					var amount = result.getValue(result.columns[2]);
					var fAmount = result.getValue(result.columns[3]);
					var debitAmt = result.getValue(result.columns[4]);
					var creditAmount = result.getValue(result.columns[5]);
					// if (entityN != entity) {
					// return true;
					// }
					// console.log(entityN);
					// console.log(entity);
					// if (debit == null && credit == null) {
					// return true;
					// }
					// var excRate = result.getValue(result.columns[4]);
					// var excRate = currencyFmt.exchangeRate({
					// source : currency,
					// target : 'USD'
					// });
					var balance = debitAmt - creditAmount;
					if (balance == 0) {
						return true;
					}
					if (balance > 0) {
						amount = Math.abs(amount);
						fAmount = Math.abs(fAmount);
					} else if (balance < 0) {
						amount = Math.abs(amount) * -1;
						fAmount = Math.abs(fAmount) * -1;
					}
					// // var balanceCurr = balanceBase / exchangeRate;
					// if (balanceBase == 0) {
					// return true;
					// }
					// ���sublist
					var lineOt = currentRecord.selectNewLine({
						sublistId : 'custpage_tn_mergepay_ot'
					});
					// alert(account);
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
						value : fAmount
					});
					lineOt.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_ot',
						fieldId : 'custpage_ot_balancebase',
						value : amount
					});
					lineOt.commitLine({
						sublistId : 'custpage_tn_mergepay_ot'
					});
					return true;
				});
			}
			function setInvSublist(searchId, search, initFilter, currentRecord) {
				var recSearch = search.load({
					id : searchId
				});
				recSearch.filterExpression = recSearch.filterExpression
						.concat([ 'AND', initFilter ]);
				// console.log(otherSearch.filterExpression);
				recSearch.run().each(function(result) {
					// var account = result.getValue(result.columns[0]);
					var date = result.getValue(result.columns[1]);
					var tranid = result.getValue(result.columns[2]);
					var currency = result.getValue(result.columns[3]);
					var account = result.getValue(result.columns[4]);
					var amountF = result.getValue(result.columns[5]);
					var amountRemF = result.getValue(result.columns[6]);
					var amount = result.getValue(result.columns[7]);
					var amountRem = result.getValue(result.columns[8]);
					var memo = result.getValue(result.columns[9]);
					var line = result.getValue(result.columns[10]);
					// ���sublist
					var lineInv = currentRecord.selectNewLine({
						sublistId : 'custpage_tn_mergepay_invoice'
					});
					// alert(account);
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_invoice',
						fieldId : 'custpage_inv_date',
						value : date,
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_invoice',
						fieldId : 'custpage_inv_type',
						value : result.id
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_invoice',
						fieldId : 'custpage_inv_refnum',
						value : tranid
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_invoice',
						fieldId : 'custpage_inv_currency',
						value : currency
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_invoice',
						fieldId : 'custpage_inv_araccount',
						value : account
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_invoice',
						fieldId : 'custpage_inv_memo',
						value : memo
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_invoice',
						fieldId : 'custpage_inv_total',
						value : amountF
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_invoice',
						fieldId : 'custpage_inv_due',
						value : amountRemF
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_invoice',
						fieldId : 'custpage_inv_totalbase',
						value : amount
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_invoice',
						fieldId : 'custpage_inv_duebase',
						value : amountRem
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_invoice',
						fieldId : 'custpage_inv_line',
						value : line
					});
					lineInv.commitLine({
						sublistId : 'custpage_tn_mergepay_invoice'
					});
					return true;
				});
			}
			function setCreSublist(searchId, search, initFilter, currentRecord) {
				var recSearch = search.load({
					id : searchId
				});
				recSearch.filterExpression = recSearch.filterExpression
						.concat([ 'AND', initFilter ]);
				// console.log(otherSearch.filterExpression);
				recSearch.run().each(function(result) {
					// var account = result.getValue(result.columns[0]);
					var date = result.getValue(result.columns[1]);
					var tranid = result.getValue(result.columns[2]);
					var currency = result.getValue(result.columns[3]);
					var account = result.getValue(result.columns[4]);
					var amountF = result.getValue(result.columns[5]);
					var amountRemF = result.getValue(result.columns[6]);
					var amount = result.getValue(result.columns[7]);
					var amountRem = result.getValue(result.columns[8]);
					var memo = result.getValue(result.columns[9]);
					var line = result.getValue(result.columns[10]);
					// ���sublist
					var lineInv = currentRecord.selectNewLine({
						sublistId : 'custpage_tn_mergepay_credit'
					});
					// alert(account);
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_credit',
						fieldId : 'custpage_cre_date',
						value : date,
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_credit',
						fieldId : 'custpage_cre_type',
						value : result.id
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_credit',
						fieldId : 'custpage_cre_refnum',
						value : tranid
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_credit',
						fieldId : 'custpage_cre_currency',
						value : currency
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_credit',
						fieldId : 'custpage_cre_araccount',
						value : account
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_credit',
						fieldId : 'custpage_cre_memo',
						value : memo
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_credit',
						fieldId : 'custpage_cre_total',
						value : amountF
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_credit',
						fieldId : 'custpage_cre_due',
						value : amountRemF
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_credit',
						fieldId : 'custpage_cre_totalbase',
						value : amount
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_credit',
						fieldId : 'custpage_cre_line',
						value : line
					});
					lineInv.commitLine({
						sublistId : 'custpage_tn_mergepay_credit'
					});
					return true;
				});
			}
			function setAPSublist(searchId, search, initFilter, currentRecord) {
				var recSearch = search.load({
					id : searchId
				});
				recSearch.filterExpression = recSearch.filterExpression
						.concat([ 'AND', initFilter ]);
				// console.log(otherSearch.filterExpression);
				recSearch.run().each(function(result) {
					// var account = result.getValue(result.columns[0]);
					var date = result.getValue(result.columns[1]);
					var tranid = result.getValue(result.columns[2]);
					var currency = result.getValue(result.columns[3]);
					var account = result.getValue(result.columns[4]);
					var amountF = result.getValue(result.columns[5]);
					var amountRemF = result.getValue(result.columns[6]);
					var amount = result.getValue(result.columns[7]);
					var amountRem = result.getValue(result.columns[8]);
					var memo = result.getValue(result.columns[9]);
					var line = result.getValue(result.columns[10]);
					// ���sublist
					var lineInv = currentRecord.selectNewLine({
						sublistId : 'custpage_tn_mergepay_ap'
					});
					// alert(account);
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_ap',
						fieldId : 'custpage_ap_date',
						value : date,
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_ap',
						fieldId : 'custpage_ap_type',
						value : result.id
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_ap',
						fieldId : 'custpage_ap_refnum',
						value : tranid
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_ap',
						fieldId : 'custpage_ap_currency',
						value : currency
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_ap',
						fieldId : 'custpage_ap_apaccount',
						value : account
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_ap',
						fieldId : 'custpage_ap_memo',
						value : memo
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_ap',
						fieldId : 'custpage_ap_total',
						value : amountF
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_ap',
						fieldId : 'custpage_ap_due',
						value : amountRemF
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_ap',
						fieldId : 'custpage_ap_totalbase',
						value : amount
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_ap',
						fieldId : 'custpage_ap_duebase',
						value : amountRem
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'custpage_tn_mergepay_ap',
						fieldId : 'custpage_ap_line',
						value : line
					});
					lineInv.commitLine({
						sublistId : 'custpage_tn_mergepay_ap'
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