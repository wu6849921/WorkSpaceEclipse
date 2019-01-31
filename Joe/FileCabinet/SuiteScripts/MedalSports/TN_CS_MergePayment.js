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
				if (sublistFieldName === 'custrecord_tn_payment_currency'
						|| sublistFieldName === 'custrecord_tn_payment_date') {
					// 自动设置exchangeRate
					var currency = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_currency'
					});
					var date = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_date'
					});
					if (currency && date) {
						var rate = currencyFmt.exchangeRate({
							source : currency,
							target : 'USD',
							date : date
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
									id : result.id
								});
								customerId = entity;
								vendorId = cusRecord.getValue({
									fieldId : 'custentity_tn_customer_vendor'
								});
							} else if (result.recordType == 'vendor') {
								var venRecord = record.load({
									type : record.Type.VENDOR,
									id : result.id
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
							sublistId : 'recmachcustrecord_tn_mpinv_mpid'
						});
						for (var i = 0; i < invCount; i++) {
							currentRecord.removeLine({
								sublistId : 'recmachcustrecord_tn_mpinv_mpid',
								line : 0
							});
						}
						// ar_credit
						var creCount = currentRecord.getLineCount({
							sublistId : 'recmachcustrecord_tn_mpcre_mpid'
						});
						for (var i = 0; i < creCount; i++) {
							currentRecord.removeLine({
								sublistId : 'recmachcustrecord_tn_mpcre_mpid',
								line : 0
							});
						}
						// ap
						var apCount = currentRecord.getLineCount({
							sublistId : 'recmachcustrecord_tn_mpap_mpid'
						});
						for (var i = 0; i < apCount; i++) {
							currentRecord.removeLine({
								sublistId : 'recmachcustrecord_tn_mpap_mpid',
								line : 0
							});
						}
						// others
						var apCount = currentRecord.getLineCount({
							sublistId : 'recmachcustrecord_tn_mpot_mpid'
						});
						for (var i = 0; i < apCount; i++) {
							currentRecord.removeLine({
								sublistId : 'recmachcustrecord_tn_mpot_mpid',
								line : 0
							});
						}
						// 2.1设置invoice sublist
						// alert(currency);
						if (customerId && currency) {

							// 设置invoice sublist
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

							// 设置credit sublist
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

						// 3.设置AP sublist
						// 得到bill
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
							// 设置bill和billCredit
							var searchIdBill = 'customsearch_tn_mergepayment_bill';
							setAPSublist(searchIdBill, search, initFilter,
									currentRecord);
							// 设置JE

							var searchIdJE = 'customsearch_tn_mergepayment_jeap';
							setAPSublist(searchIdJE, search, initFilter,
									currentRecord);
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
							setOthersTab1(currentRecord, search);
						}

					}

				}
				var payAmount = currentRecord.getValue({
					fieldId : 'custrecord_tn_payment_amount',
					value : total
				});
				// 设置 others tab 数据
				if (sublistFieldName === 'custrecord_tn_fromyear'
						|| sublistFieldName === 'custrecord_tn_toyear') {
					setOthersTab1(currentRecord, search);
				}
				// 设置AR选中及baseamount
				if (sublistName === 'recmachcustrecord_tn_mpinv_mpid'
						&& sublistFieldName === 'custrecord_inv_amount') {
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
						fieldId : 'custrecord_inv_apply'
					});
					var amount = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custrecord_inv_amount'
					});
					var currencyLine = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custrecord_inv_currency'
					});
					if (!apply && amount) {
						// alert(1);
						currentRecord.setCurrentSublistValue({
							sublistId : sublistName,
							fieldId : 'custrecord_inv_apply',
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
							fieldId : 'custrecord_inv_amountbase',
							value : amtBase
						});
					}
				}
				if (sublistName === 'recmachcustrecord_tn_mpcre_mpid'
						&& sublistFieldName === 'custrecord_cre_amount') {
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
						fieldId : 'custrecord_cre_apply'
					});
					var amount = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custrecord_cre_amount'
					});
					var currencyLine = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custrecord_cre_currency'
					});
					if (!apply && amount) {
						// alert(1);
						currentRecord.setCurrentSublistValue({
							sublistId : sublistName,
							fieldId : 'custrecord_cre_apply',
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
							fieldId : 'custrecord_cre_amountbase',
							value : amtBase
						});
					}
				}

				// 设置ap选中及baseamount
				if (sublistName === 'recmachcustrecord_tn_mpap_mpid'
						&& sublistFieldName === 'custrecord_ap_amount') {
					var exchangeRate = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_exrate'
					});
					var bankcurrency = currentRecord.getValue({
						fieldId : 'custrecord_tn_bankcurrency'
					});
					var apply = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custrecord_ap_apply'
					});
					var total = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custrecord_ap_total'
					});
					var amount = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custrecord_ap_amount'
					});
					var currencyLine = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custrecord_ap_currency'
					});
					if (!apply && amount) {
						// alert(1);
						if (total > 0) {
							currentRecord.setCurrentSublistValue({
								sublistId : sublistName,
								fieldId : 'custrecord_ap_apply',
								value : true
							});
						} else {
							if (total != amount) {
								currentRecord.setCurrentSublistValue({
									sublistId : sublistName,
									fieldId : 'custrecord_ap_amount',
									value : 0
								});
								currentRecord.setCurrentSublistValue({
									sublistId : sublistName,
									fieldId : 'custrecord_ap_apply',
									value : false
								});
							} else {
								currentRecord.setCurrentSublistValue({
									sublistId : sublistName,
									fieldId : 'custrecord_ap_apply',
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
								fieldId : 'custrecord_ap_amountbase',
								value : amtBase
							});
						} else {
							if (total != amount) {
								currentRecord.setCurrentSublistValue({
									sublistId : sublistName,
									fieldId : 'custrecord_ap_amountbase',
									value : 0
								});
							} else {
								currentRecord.setCurrentSublistValue({
									sublistId : sublistName,
									fieldId : 'custrecord_ap_amountbase',
									value : amtBase
								});
							}
						}
					}
				}
				// 设置others选中及baseamount
				if (sublistName === 'recmachcustrecord_tn_mpot_mpid'
						&& sublistFieldName === 'custrecord_ot_amount') {
					var exchangeRate = currentRecord.getValue({
						fieldId : 'custrecord_tn_payment_exrate'
					});
					var bankcurrency = currentRecord.getValue({
						fieldId : 'custrecord_tn_bankcurrency'
					});
					var currencyLine = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custrecord_ot_currency'
					});
					var apply = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custrecord_ot_apply'
					});
					var amount = currentRecord.getCurrentSublistValue({
						sublistId : sublistName,
						fieldId : 'custrecord_ot_amount'
					});
					if (!apply && amount) {
						// alert(1);
						currentRecord.setCurrentSublistValue({
							sublistId : sublistName,
							fieldId : 'custrecord_ot_apply',
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
							fieldId : 'custrecord_ot_amountbase',
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
						// alert('请不要修改合并传票！');
						// return false
						// 第三步：保存前生成MPNum
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
						currentRecord.setValue({
							fieldId : 'name',
							value : numPrefix
						});
					}
					// else {
					// alert('请不要修改合并传票！');
					// return false
					// }
					// currentRecord.setValue({
					// fieldId : 'name',
					// value : number
					// });
					// 计算sublist balance
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
					// 设置bankamount
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
					if (paymentBalance > 0 && balance != 0
							&& balanceaccount == '') {
						alert('Banlance Account不能為空！');
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
					fieldId : 'custrecord_startdate'
				});
				var endDate = suiteletPage.getValue({
					fieldId : 'custrecord_enddate'
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
					sublistId : 'recmachcustrecord_tn_mpinv_mpid'
				});
				var creNum = currentRecord.getLineCount({
					sublistId : 'recmachcustrecord_tn_mpcre_mpid'
				});
				var apNum = currentRecord.getLineCount({
					sublistId : 'recmachcustrecord_tn_mpap_mpid'
				});
				var otNum = currentRecord.getLineCount({
					sublistId : 'recmachcustrecord_tn_mpot_mpid'
				});
				var npNum = currentRecord.getLineCount({
					sublistId : 'recmachcustrecord_tn_mpnp_mpid'
				});
				var debitAmount = 0;
				var creditAmount = 0;
				// AR
				// invoice
				// 查询有几种currency
				var currencys = [];
				// 先查询有几种currency
				for (var i = 0; i < invNum; i++) {
					var currency = currentRecord.getSublistValue({
						sublistId : 'recmachcustrecord_tn_mpinv_mpid',
						fieldId : 'custrecord_inv_currency',
						line : i
					});
					var isSelect = currentRecord.getSublistValue({
						sublistId : 'recmachcustrecord_tn_mpinv_mpid',
						fieldId : 'custrecord_inv_apply',
						line : i
					});
					var arAccount = currentRecord.getSublistValue({
						sublistId : 'recmachcustrecord_tn_mpinv_mpid',
						fieldId : 'custrecord_inv_araccount',
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
							sublistId : 'recmachcustrecord_tn_mpinv_mpid',
							fieldId : 'custrecord_inv_apply',
							line : j
						});
						var payment = currentRecord.getSublistValue({
							sublistId : 'recmachcustrecord_tn_mpinv_mpid',
							fieldId : 'custrecord_inv_amount',
							line : j
						});
						var currencyL = currentRecord.getSublistValue({
							sublistId : 'recmachcustrecord_tn_mpinv_mpid',
							fieldId : 'custrecord_inv_currency',
							line : j
						});
						var arAccountL = currentRecord.getSublistValue({
							sublistId : 'recmachcustrecord_tn_mpinv_mpid',
							fieldId : 'custrecord_inv_araccount',
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
				// 查询有几种currency
				var currencysCre = [];
				for (var i = 0; i < creNum; i++) {
					var currency = currentRecord.getSublistValue({
						sublistId : 'recmachcustrecord_tn_mpcre_mpid',
						fieldId : 'custrecord_cre_currency',
						line : i
					});
					var isSelect = currentRecord.getSublistValue({
						sublistId : 'recmachcustrecord_tn_mpcre_mpid',
						fieldId : 'custrecord_cre_apply',
						line : i
					});
					var arAccount = currentRecord.getSublistValue({
						sublistId : 'recmachcustrecord_tn_mpcre_mpid',
						fieldId : 'custrecord_cre_araccount',
						line : i
					});
					var curAcc = currency + ',' + arAccount;
					if (currencysCre.indexOf(curAcc) == '-1' && isSelect) {
						currencysCre.push(curAcc);
					}
				}
				// alert(currencysCre);
				for (var i = 0; i < currencysCre.length; i++) {
					var currency = currencysCre[i].split(',')[0];
					var arAccount = currencysCre[i].split(',')[1];
					var creSum = 0;
					for (var j = 0; j < creNum; j++) {
						var isSelect = currentRecord.getSublistValue({
							sublistId : 'recmachcustrecord_tn_mpcre_mpid',
							fieldId : 'custrecord_cre_apply',
							line : j
						});
						var payment = currentRecord.getSublistValue({
							sublistId : 'recmachcustrecord_tn_mpcre_mpid',
							fieldId : 'custrecord_cre_amount',
							line : j
						});
						var currencyL = currentRecord.getSublistValue({
							sublistId : 'recmachcustrecord_tn_mpcre_mpid',
							fieldId : 'custrecord_cre_currency',
							line : j
						});
						var arAccountL = currentRecord.getSublistValue({
							sublistId : 'recmachcustrecord_tn_mpcre_mpid',
							fieldId : 'custrecord_cre_araccount',
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
				// 查询有几种currency
				var currencysAp = [];
				for (var i = 0; i < apNum; i++) {
					var currency = currentRecord.getSublistValue({
						sublistId : 'recmachcustrecord_tn_mpap_mpid',
						fieldId : 'custrecord_ap_currency',
						line : i
					});
					var isSelect = currentRecord.getSublistValue({
						sublistId : 'recmachcustrecord_tn_mpap_mpid',
						fieldId : 'custrecord_ap_apply',
						line : i
					});
					var apAccount = currentRecord.getSublistValue({
						sublistId : 'recmachcustrecord_tn_mpap_mpid',
						fieldId : 'custrecord_ap_apaccount',
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
							sublistId : 'recmachcustrecord_tn_mpap_mpid',
							fieldId : 'custrecord_ap_apply',
							line : j
						});
						var payment = currentRecord.getSublistValue({
							sublistId : 'recmachcustrecord_tn_mpap_mpid',
							fieldId : 'custrecord_ap_amount',
							line : j
						});
						var currencyL = currentRecord.getSublistValue({
							sublistId : 'recmachcustrecord_tn_mpap_mpid',
							fieldId : 'custrecord_ap_currency',
							line : j
						});
						var apAccountL = currentRecord.getSublistValue({
							sublistId : 'recmachcustrecord_tn_mpap_mpid',
							fieldId : 'custrecord_ap_apaccount',
							line : j
						});
						var total = currentRecord.getSublistValue({
							sublistId : 'recmachcustrecord_tn_mpap_mpid',
							fieldId : 'custrecord_ap_total',
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
				// 其他
				for (var i = 0; i < otNum; i++) {
					var apply = currentRecord.getSublistValue({
						sublistId : 'recmachcustrecord_tn_mpot_mpid',
						fieldId : 'custrecord_ot_apply',
						line : i
					});
					var paymentBase = currentRecord.getSublistValue({
						sublistId : 'recmachcustrecord_tn_mpot_mpid',
						fieldId : 'custrecord_ot_amountbase',
						line : i
					});
					var balance = currentRecord.getSublistValue({
						sublistId : 'recmachcustrecord_tn_mpot_mpid',
						fieldId : 'custrecord_ot_balance',
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

				// 未立項
				var tmpDebitAmt = 0;
				var tmpCreditAmt = 0;
				for (var i = 0; i < npNum; i++) {
					var debit = currentRecord.getSublistValue({
						sublistId : 'custrecord_tn_mergepay_np',
						fieldId : 'custrecord_np_debit',
						line : i
					});
					var credit = currentRecord.getSublistValue({
						sublistId : 'custrecord_tn_mergepay_np',
						fieldId : 'custrecord_np_credit',
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
				// 開始計算
				var balance = debitAmount - creditAmount;
				return balance;
			}

			function setOthersTab1(currentRecord, search) {
				var entity = currentRecord.getValue({
					fieldId : 'custrecord_tn_payment_entity'
				});
				var exchangeRate = currentRecord.getValue({
					fieldId : 'custrecord_tn_payment_exrate'
				});
				var fromyear = currentRecord.getValue({
					fieldId : 'custrecord_tn_fromyear'
				});
				// var fromyearT = currentRecord.getText({
				// fieldId : 'custrecord_tn_fromyear'
				// });
				var toyear = currentRecord.getValue({
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
					var yearNum = toyear - fromyear + 1;
					// alert(yearNum);
					if (yearNum <= 0) {
						alert('to year 要大於  from year!');
						return;
					}
					var years = [];
					// var yearsT = [];
					for (var i = 0; i < yearNum; i++) {
						years.push(parseInt(fromyear) + i);
						// yearsT.push(parseInt(fromyearT) + i);
					}
					var accounts = [];
					// alert(fromyear);
					var otherSearch = search.load({
						id : 'customsearch_mp_others'
					});
					var yearFilter = [
							[ 'entity', 'anyof', entity ],
							'AND',
							[ [ 'custcol_csegtn_year', 'anyof', years ], 'OR',
									[ 'custcol_csegtn_year', 'anyof', years ] ] ];
					if (currency != bankCurrency && currency != '1') {
						yearFilter.push('AND', [ 'currency', 'anyof',
								[ currency, '1' ] ]);
					} else {
						yearFilter.push('AND',
								[ 'currency', 'anyof', currency ]);
					}
					// alert(yearFilter);
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
					// alert(accounts);
					// 先删除others
					var apCount = currentRecord.getLineCount({
						sublistId : 'recmachcustrecord_tn_mpot_mpid'
					});
					for (var i = 0; i < apCount; i++) {
						currentRecord.removeLine({
							sublistId : 'recmachcustrecord_tn_mpot_mpid',
							line : 0
						});
					}

					// 查询开始，先根据每个account 再根据每个年度
					for (var i = 0; i < accounts.length; i++) {
						var account = accounts[i];
						for (var j = 0; j < years.length; j++) {
							var initFilterO = [ [ 'entity', 'anyof', entity ],
									'AND', [ 'account', 'anyof', account ] ];
							if (currency != bankCurrency && currency != '1') {
								initFilterO.push('AND', [ 'currency', 'anyof',
										[ currency, '1' ] ]);
							} else {
								initFilterO.push('AND', [ 'currency', 'anyof',
										currency ]);
							}
							var year = years[j];
							// var yearT = yearsT[j];
							// alert(yearT);
							// alert(yearBeginV + '|' + yearEndV);
							// alert(account);
							initFilterO.push('AND', [
									[ 'custcol_csegtn_year', 'anyof', year ],
									'OR',
									[ 'custcol_csegtn_year', 'anyof', year ] ]);
							var lineOtYear = currentRecord.selectNewLine({
								sublistId : 'recmachcustrecord_tn_mpot_mpid'
							});
							lineOtYear.setCurrentSublistValue({
								sublistId : 'recmachcustrecord_tn_mpot_mpid',
								fieldId : 'custrecord_ot_account',
								value : account,
							});
							lineOtYear.commitLine({
								sublistId : 'recmachcustrecord_tn_mpot_mpid'
							});
							setOthersTab(entity, search, initFilterO, year,
									currentRecord, exchangeRate);
						}
					}

				}

			}

			function setOthersTab(entity, search, initFilter, year,
					currentRecord, exchangeRate) {
				var otherSearch = search.load({
					id : 'customsearch_mp_others'
				});
				otherSearch.filterExpression = otherSearch.filterExpression
						.concat([ 'AND', initFilter ]);
				// alert(otherSearch.filterExpression);
				var lineOtYear = currentRecord.selectNewLine({
					sublistId : 'recmachcustrecord_tn_mpot_mpid'
				});
				lineOtYear.setCurrentSublistValue({
					sublistId : 'recmachcustrecord_tn_mpot_mpid',
					fieldId : 'custrecord_ot_year',
					value : year,
				});
				lineOtYear.commitLine({
					sublistId : 'recmachcustrecord_tn_mpot_mpid'
				});
				otherSearch.run().each(function(result) {
					var account = result.getValue(result.columns[0]);
					var currency = result.getValue(result.columns[1]);
					var amount = result.getValue(result.columns[2]);
					var fAmount = result.getValue(result.columns[3]);
					var debitAmt = result.getValue(result.columns[4]);
					var creditAmount = result.getValue(result.columns[5]);
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
					// 填充sublist
					var lineOt = currentRecord.selectNewLine({
						sublistId : 'recmachcustrecord_tn_mpot_mpid'
					});
					// alert(account);
					lineOt.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpot_mpid',
						fieldId : 'custrecord_ot_account',
						value : account,
					});
					lineOt.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpot_mpid',
						fieldId : 'custrecord_ot_currency',
						value : currency
					});
					lineOt.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpot_mpid',
						fieldId : 'custrecord_ot_balance',
						value : fAmount
					});
					lineOt.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpot_mpid',
						fieldId : 'custrecord_ot_balancebase',
						value : amount
					});
					lineOt.setCurrentSublistValue({// 新增year add by joe 1220
						sublistId : 'recmachcustrecord_tn_mpot_mpid',
						fieldId : 'custrecord_ot_year',
						value : year
					});
					lineOt.commitLine({
						sublistId : 'recmachcustrecord_tn_mpot_mpid'
					});
					// alert(account);
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
					// 填充sublist
					var lineInv = currentRecord.selectNewLine({
						sublistId : 'recmachcustrecord_tn_mpinv_mpid'
					});
//					alert('setInvSublist1:'+date);
					date = format.parse({
						value : date,
						type : format.Type.DATE
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpinv_mpid',
						fieldId : 'custrecord_inv_date',
						value : date,
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpinv_mpid',
						fieldId : 'custrecord_inv_type',
						value : result.id
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpinv_mpid',
						fieldId : 'custrecord_inv_refnum',
						value : tranid
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpinv_mpid',
						fieldId : 'custrecord_inv_currency',
						value : currency
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpinv_mpid',
						fieldId : 'custrecord_inv_araccount',
						value : account
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpinv_mpid',
						fieldId : 'custrecord_inv_memo',
						value : memo
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpinv_mpid',
						fieldId : 'custrecord_inv_total',
						value : amountF
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpinv_mpid',
						fieldId : 'custrecord_inv_due',
						value : amountRemF
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpinv_mpid',
						fieldId : 'custrecord_inv_totalbase',
						value : amount
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpinv_mpid',
						fieldId : 'custrecord_inv_duebase',
						value : amountRem
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpinv_mpid',
						fieldId : 'custrecord_inv_line',
						value : line
					});
					lineInv.commitLine({
						sublistId : 'recmachcustrecord_tn_mpinv_mpid'
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
					// 填充sublist
					var lineInv = currentRecord.selectNewLine({
						sublistId : 'recmachcustrecord_tn_mpcre_mpid'
					});
					// alert(account);
					date = format.parse({
						value : date,
						type : format.Type.DATE
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpcre_mpid',
						fieldId : 'custrecord_cre_date',
						value : date,
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpcre_mpid',
						fieldId : 'custrecord_cre_type',
						value : result.id
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpcre_mpid',
						fieldId : 'custrecord_cre_refnum',
						value : tranid
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpcre_mpid',
						fieldId : 'custrecord_cre_currency',
						value : currency
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpcre_mpid',
						fieldId : 'custrecord_cre_araccount',
						value : account
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpcre_mpid',
						fieldId : 'custrecord_cre_memo',
						value : memo
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpcre_mpid',
						fieldId : 'custrecord_cre_total',
						value : amountF
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpcre_mpid',
						fieldId : 'custrecord_cre_due',
						value : amountRemF
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpcre_mpid',
						fieldId : 'custrecord_cre_totalbase',
						value : amount
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpcre_mpid',
						fieldId : 'custrecord_cre_duebase',
						value : amountRem
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpcre_mpid',
						fieldId : 'custrecord_cre_line',
						value : line
					});
					lineInv.commitLine({
						sublistId : 'recmachcustrecord_tn_mpcre_mpid'
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
					// 填充sublist
					var lineInv = currentRecord.selectNewLine({
						sublistId : 'recmachcustrecord_tn_mpap_mpid'
					});
					// alert(account);
					date = format.parse({
						value : date,
						type : format.Type.DATE
					});
//					alert('setAPSublist:'+date);
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpap_mpid',
						fieldId : 'custrecord_ap_date',
						value : date,
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpap_mpid',
						fieldId : 'custrecord_ap_type',
						value : result.id
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpap_mpid',
						fieldId : 'custrecord_ap_refnum',
						value : tranid
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpap_mpid',
						fieldId : 'custrecord_ap_currency',
						value : currency
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpap_mpid',
						fieldId : 'custrecord_ap_apaccount',
						value : account
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpap_mpid',
						fieldId : 'custrecord_ap_memo',
						value : memo
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpap_mpid',
						fieldId : 'custrecord_ap_total',
						value : amountF
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpap_mpid',
						fieldId : 'custrecord_ap_due',
						value : amountRemF
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpap_mpid',
						fieldId : 'custrecord_ap_totalbase',
						value : amount
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpap_mpid',
						fieldId : 'custrecord_ap_duebase',
						value : amountRem
					});
					lineInv.setCurrentSublistValue({
						sublistId : 'recmachcustrecord_tn_mpap_mpid',
						fieldId : 'custrecord_ap_line',
						value : line
					});
					lineInv.commitLine({
						sublistId : 'recmachcustrecord_tn_mpap_mpid'
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