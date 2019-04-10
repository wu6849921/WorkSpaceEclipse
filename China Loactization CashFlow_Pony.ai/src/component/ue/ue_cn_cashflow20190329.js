/**
 * Copyright 漏 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope Public
 */
define(
		[ '../../lib/wrapper/ns_wrapper_record', '../../lib/commons',
				'../../lib/wrapper/ns_wrapper_file',
				'../../lib/wrapper/ns_wrapper_runtime',
				'../../lib/wrapper/ns_wrapper_format',
				'../../lib/wrapper/ns_wrapper_search', 'N/error' ],

		function(record, commons, file, runtime, formatter, search, error) {
			/**
			 * Function definition to be triggered before record is loaded.
			 * 
			 * @param {Object}
			 *            scriptContext
			 * @param {Record}
			 *            scriptContext.newRecord - New record
			 * @param {Record}
			 *            scriptContext.oldRecord - Old record
			 * @param {string}
			 *            scriptContext.type - Trigger type
			 * @Since 2015.2
			 */
			function afterSubmit(scriptContext) {
				try {
					var triggerType = scriptContext.type;
					log.debug('ue_cn_cashflow', 'scriptContext.type='
							+ triggerType);
					if (triggerType === 'create' || triggerType === 'edit'
							|| triggerType === 'paybills'
							|| scriptContext.type === 'copy') {
						var currentRec = scriptContext.newRecord;
						log.debug('currentRec Type', currentRec.type);

						// log.debug('ue_cn_cashflow', 'type=' + currentRec.type
						// +
						// ',id='
						// + currentRec.id);

						if (currentRec.id === 0) {
							return;
						}
						var pymAppliedItems;
						// 对vendorpayment特殊处理
						if (currentRec.type === record.Type.VENDOR_PAYMENT) {
							// 得到数据
							pymAppliedItems = fetchPymtApplyInfo(currentRec);
							// 写入数据库
							// 对JE特殊处理
						} else if (currentRec.type === record.Type.CUSTOMER_PAYMENT) {
							pymAppliedItems = fetchCusPymtApplyInfo(currentRec);
						} else if (currentRec.type === record.Type.JOURNAL_ENTRY) {
							pymAppliedItems = fetchJEApplyInfo(currentRec);
						} else {// 其他record统一处理
							pymAppliedItems = fetchOtApplyInfo(currentRec);
						}
						if (pymAppliedItems) {
							updateCfiInfo(pymAppliedItems);
						}
					}
				} catch (e) {
					var errorObj = error.create({
						name : e.name,
						message : e.message
					});
					throw errorObj;
					log.debug('e', e);

				}

			}
			/**
			 * @desc Collect payment related data.
			 * @param {object}
			 *            [payment] - payment information.
			 * @return payment apply information array.
			 */
			function fetchPymtApplyInfo(pymtRecord) {
				try {
					var applyLineCount = pymtRecord.getLineCount({
						sublistId : 'apply'
					});
					var pymAppliedItems = {};
					var transDate = pymtRecord.getValue('trandate');
					var period = pymtRecord.getValue('postingperiod');
					var subsidiary = pymtRecord.getValue('subsidiary');
					var bankAccount = pymtRecord.getValue('account');

					// if (bankAccount.substring(0, )) {
					//					
					// }
					// log.debug('bankAccount', bankAccount);
					var accNumber = search.lookupFields({
						type : search.Type.ACCOUNT,
						id : bankAccount,
						columns : 'number'
					});
					accNumber = accNumber.number;
					// log.debug('accNumber', accNumber);
					if (accNumber.substring(0, 4) == '1401') {// 去除备用金的科目
						return pymAppliedItems;
					}
					var lineInfos = [];
					for (var i = 0; i < applyLineCount; i++) {
						var payAmount = pymtRecord.getSublistValue({
							sublistId : 'apply',
							fieldId : 'amount',
							line : i
						});
						var internalid = pymtRecord.getSublistValue({
							sublistId : 'apply',
							fieldId : 'internalid',
							line : i
						});
						// 原始的需要支付金额
						var amountTotal = pymtRecord.getSublistValue({
							sublistId : 'apply',
							fieldId : 'total',
							line : i
						});
						// log.debug('trantype', trantype);
						var _record;
						search.create(
								{
									type : 'transaction',
									filters : [
											[ 'internalid', 'is', internalid ],
											'AND', [ 'mainline', 'is', 'T' ] ],
									columns : [ 'fxamount' ]
								}).run().each(function(result) {
							_record = record.load({
								type : result.recordType,
								id : internalid
							});
							// amountTotal += parseFloat(result.getValue({
							// name : 'fxamount'
							// }));
							// return true;
						});
						var _sublistId;
						if (_record.type == 'vendorbill'
								|| _record.type == 'invoice') {
							_sublistId = 'item';
						} else if (_record.type == 'expensereport') {
							_sublistId = 'expense';
						} else if (_record.type == 'journalentry') {
							_sublistId = 'line';
						}
						// log.debug('amountTotal', amountTotal);
						var itemCount = _record.getLineCount({
							sublistId : _sublistId
						});
						for (var j = 0; j < itemCount; j++) {// 生成行数据
							var item = {};
							item.cfi = _record.getSublistValue({
								sublistId : _sublistId,
								fieldId : 'custcol_cseg_cn_cfi',
								line : j
							});
							if (!item.cfi || item.cfi == '32') {
								continue;
							}
							var amount = _record.getSublistValue({
								sublistId : _sublistId,
								fieldId : 'amount',
								line : j
							});
							if (_record.type == 'journalentry') {
								var credit = _record.getSublistValue({
									sublistId : _sublistId,
									fieldId : 'credit',
									line : j
								});
								var debit = _record.getSublistValue({
									sublistId : _sublistId,
									fieldId : 'debit',
									line : j
								});
								amount = debit ? debit : credit;
							}
							var grossAmt = _record.getSublistValue({
								sublistId : _sublistId,
								fieldId : 'grossamt',
								line : j
							});
							// log.debug('grossAmt', grossAmt);
							// log.debug('amount', amount);
							if (grossAmt) {
								// 对于税费新增一条现金流量项
								var taxAmt = grossAmt - amount;
								if (taxAmt > 0) {
									var itemTax = {};
									itemTax.cfi = _record.getSublistValue({
										sublistId : _sublistId,
										fieldId : 'custcol_cseg_cn_cfi',
										line : j
									});
									itemTax.lineUniqueKey = _record
											.getSublistValue({
												sublistId : _sublistId,
												fieldId : 'line',
												line : j
											});
									itemTax.pymtTranid = pymtRecord.id;
									itemTax.paidTranid = internalid;
									itemTax.subsidiary = subsidiary;
									itemTax.period = period;
									itemTax.transDate = transDate;
									itemTax.amount = payAmount * taxAmt
											/ amountTotal;
									itemTax.amount = itemTax.amount.toFixed(2);
									lineInfos.push(itemTax);
								}
							}
							item.lineUniqueKey = _record.getSublistValue({
								sublistId : _sublistId,
								fieldId : 'line',
								line : j
							});
							item.pymtTranid = pymtRecord.id;
							item.paidTranid = internalid;
							item.subsidiary = subsidiary;
							item.period = period;
							item.transDate = transDate;
							item.amount = payAmount * amount / amountTotal;
							// log.debug('item.amount', payAmount);
							// log.debug('item.amount', amount);
							// log.debug('item.amount', amountTotal);
							if (_record.type == 'journalentry') {
								item.amount = item.amount * -1;
							}
							item.amount = item.amount.toFixed(2);
							lineInfos.push(item);
						}
					}
					pymAppliedItems[pymtRecord.id] = lineInfos;
					log.debug('pymAppliedItems', JSON
							.stringify(pymAppliedItems));
					return pymAppliedItems;
				} catch (e) {
					log.debug('e', e);
				}

			}
			/**
			 * @desc Collect payment related data.
			 * @param {object}
			 *            [payment] - payment information.
			 * @return payment apply information array.
			 */
			function fetchCusPymtApplyInfo(pymtRecord) {
				try {
					var applyLineCount = pymtRecord.getLineCount({
						sublistId : 'apply'
					});
					var pymAppliedItems = {};
					var transDate = pymtRecord.getValue('trandate');
					var period = pymtRecord.getValue('postingperiod');
					var subsidiary = pymtRecord.getValue('subsidiary');
					var lineInfos = [];
					for (var i = 0; i < applyLineCount; i++) {
						var payAmount = pymtRecord.getSublistValue({
							sublistId : 'apply',
							fieldId : 'amount',
							line : i
						});
						var invLine = pymtRecord.getSublistValue({
							sublistId : 'apply',
							fieldId : 'line',
							line : i
						});
						var internalid = pymtRecord.getSublistValue({
							sublistId : 'apply',
							fieldId : 'internalid',
							line : i
						});
						// log.debug('trantype', trantype);
						var _record;
						search.create(
								{
									type : 'transaction',
									filters : [
											[ 'internalid', 'is', internalid ],
											'AND', [ 'mainline', 'is', 'T' ] ],
									columns : [ 'fxamount' ]
								}).run().each(function(result) {
							_record = record.load({
								type : result.recordType,
								id : internalid
							});
						});
						if (_record.type == 'invoice') {// 对于invoice预付情况特殊处理
							var createdInvoice = _record
									.getValue('createdfrom');
							var cusDepAmount = 0;
							search.create(
									{
										type : 'customerdeposit',
										filters : [
												[ 'salesorder', 'is',
														createdInvoice ],
												'AND',
												[ 'mainline', 'is', 'T' ] ],
										columns : [ 'fxamount',
												'custbody_cseg_cn_cfi' ]
									}).run().each(function(result) {
								var cfiCusDep = result.getValue({
									name : 'custbody_cseg_cn_cfi'
								});
								var amt = result.getValue({
									name : 'fxamount'
								});
								amt = parseFloat(amt);
								cusDepAmount += amt;
								var itemCusDep = {};
								itemCusDep.cfi = cfiCusDep;
								itemCusDep.lineUniqueKey = invLine;
								itemCusDep.pymtTranid = pymtRecord.id;
								itemCusDep.paidTranid = result.id;
								itemCusDep.subsidiary = subsidiary;
								itemCusDep.period = period;
								itemCusDep.transDate = transDate;
								amt = amt * -1;
								itemCusDep.amount = amt.toFixed(2);
								lineInfos.push(itemCusDep);
								return true;
							});
							payAmount += cusDepAmount;
						}
						// 原始的需要支付金额
						var amountTotal = pymtRecord.getSublistValue({
							sublistId : 'apply',
							fieldId : 'total',
							line : i
						});

						var _sublistId;
						if (_record.type == 'invoice') {
							_sublistId = 'item';
						} else if (_record.type == 'journalentry') {
							_sublistId = 'line';
						}
						// log.debug('amountTotal', amountTotal);
						var itemCount = _record.getLineCount({
							sublistId : _sublistId
						});
						for (var j = 0; j < itemCount; j++) {// 生成行数据
							var item = {};
							item.cfi = _record.getSublistValue({
								sublistId : _sublistId,
								fieldId : 'custcol_cseg_cn_cfi',
								line : j
							});
							if (!item.cfi || item.cfi == '32') {
								continue;
							}
							var amount = _record.getSublistValue({
								sublistId : _sublistId,
								fieldId : 'amount',
								line : j
							});
							if (_record.type == 'journalentry') {
								var credit = _record.getSublistValue({
									sublistId : _sublistId,
									fieldId : 'credit',
									line : j
								});
								var debit = _record.getSublistValue({
									sublistId : _sublistId,
									fieldId : 'debit',
									line : j
								});
								amount = debit ? debit : credit;
							}
							var grossAmt = _record.getSublistValue({
								sublistId : _sublistId,
								fieldId : 'grossamt',
								line : j
							});
							// log.debug('grossAmt', grossAmt);
							// log.debug('amount', amount);
							if (grossAmt) {
								// 对于税费新增一条现金流量项
								var taxAmt = grossAmt - amount;
								if (taxAmt > 0) {
									var itemTax = {};
									itemTax.cfi = _record.getSublistValue({
										sublistId : _sublistId,
										fieldId : 'custcol_cseg_cn_cfi',
										line : j
									});
									itemTax.lineUniqueKey = _record
											.getSublistValue({
												sublistId : _sublistId,
												fieldId : 'line',
												line : j
											});
									itemTax.pymtTranid = pymtRecord.id;
									itemTax.paidTranid = internalid;
									itemTax.subsidiary = subsidiary;
									itemTax.period = period;
									itemTax.transDate = transDate;
									itemTax.amount = payAmount * taxAmt
											/ amountTotal;
									itemTax.amount = itemTax.amount.toFixed(2);
									lineInfos.push(itemTax);
								}
							}
							item.lineUniqueKey = _record.getSublistValue({
								sublistId : _sublistId,
								fieldId : 'line',
								line : j
							});
							item.pymtTranid = pymtRecord.id;
							item.paidTranid = internalid;
							item.subsidiary = subsidiary;
							item.period = period;
							item.transDate = transDate;
							item.amount = payAmount * amount / amountTotal;
							// log.debug('item.amount', payAmount);
							// log.debug('item.amount', amount);
							// log.debug('item.amount', amountTotal);
							if (_record.type == 'journalentry') {
								item.amount = item.amount * -1;
							}
							item.amount = item.amount.toFixed(2);
							lineInfos.push(item);
						}
					}
					pymAppliedItems[pymtRecord.id] = lineInfos;
					log.debug('pymAppliedItems', JSON
							.stringify(pymAppliedItems));
					return pymAppliedItems;
				} catch (e) {
					log.debug('e', e);
				}

			}
			/**
			 * @desc Collect payment related data.
			 * @param {object}
			 *            [payment] - payment information.
			 * @return payment apply information array.
			 */
			function fetchJEApplyInfo(pymtRecord) {
				var applyLineCount = pymtRecord.getLineCount({
					sublistId : 'line'
				});
				var pymAppliedItems = {};
				var transDate = pymtRecord.getValue('trandate');
				// 如果做了反冲JE，那就直接做一条相反的
				var reversalDate = pymtRecord.getValue('reversaldate');
				// var reversalEntry = pymtRecord.getValue('reversalentry');
				// log.debug('reversalEntry', reversalEntry);
				var period = pymtRecord.getValue('postingperiod');
				var subsidiary = pymtRecord.getValue('subsidiary');
				var approvalStatus = pymtRecord.getValue('approvalstatus');
				var accountingBook = pymtRecord.getValue('accountingbook');
				// log.debug('accountingBook', accountingBook);
				if (accountingBook) {
					if (accountingBook != '1') {
						return pymAppliedItems;
					}
				}
				if (approvalStatus != '2') {
					return pymAppliedItems;
				}
				var lineInfos = [];
				for (var i = 0; i < applyLineCount; i++) {
					var cfi = pymtRecord.getSublistValue({
						sublistId : 'line',
						fieldId : 'custcol_cseg_cn_cfi',
						line : i
					});
					if (!cfi || cfi === '32') {
						continue;
					}
					var inOut = '1';
					inOut = search.lookupFields({
						type : 'customrecord_cseg_cn_cfi',
						id : cfi,
						columns : 'custrecord_cash_in_out_flow'
					});
					if (commons.makesure(inOut.custrecord_cash_in_out_flow)) {
						// alert(JSON.stringify(cashFlowItem));
						inOut = inOut.custrecord_cash_in_out_flow[0].value;
					}

					var debitAmount = pymtRecord.getSublistValue({
						sublistId : 'line',
						fieldId : 'debit',
						line : i
					});
					var creditAmount = pymtRecord.getSublistValue({
						sublistId : 'line',
						fieldId : 'credit',
						line : i
					});
					var line = pymtRecord.getSublistValue({
						sublistId : 'line',
						fieldId : 'line',
						line : i
					});
					var account = pymtRecord.getSublistValue({
						sublistId : 'line',
						fieldId : 'account',
						line : i
					});
					var item = {};
					item.lineUniqueKey = line;
					item.pymtTranid = pymtRecord.id;
					item.subsidiary = subsidiary;
					item.period = period;
					item.transDate = transDate;
					item.cfi = cfi;
					item.amount = debitAmount ? debitAmount : creditAmount;
					// log.debug('debitAmount', debitAmount);
					// log.debug('inOut', inOut);
					if ((debitAmount && inOut === '2')
							|| (creditAmount && inOut === '1')) {
						item.amount = item.amount * -1;
					}
					item.amount = parseFloat(item.amount);
					item.amount = item.amount.toFixed(2);
					// log.debug('item', item);
					lineInfos.push(item);

					// 如果反冲日期不为空，则直接生成一条反向的现金流量表
					if (reversalDate) {
						var itemR = {};
						itemR.lineUniqueKey = line;
						itemR.pymtTranid = pymtRecord.id;
						itemR.subsidiary = subsidiary;
						itemR.period = period;
						itemR.transDate = reversalDate;
						itemR.cfi = cfi;
						itemR.amount = debitAmount ? debitAmount : creditAmount;
						// log.debug('debitAmount', debitAmount);
						// log.debug('inOut', inOut);
						if ((debitAmount && inOut === '1')
								|| (creditAmount && inOut === '2')) {
							itemR.amount = itemR.amount * -1;
						}
						itemR.amount = parseFloat(itemR.amount);
						itemR.amount = itemR.amount.toFixed(2);
						// log.debug('item', item);
						lineInfos.push(itemR);
					}
				}
				pymAppliedItems[pymtRecord.id] = lineInfos;
				log.debug('pymAppliedItems', JSON.stringify(pymAppliedItems));
				return pymAppliedItems;
			}
			/**
			 * @desc Collect payment related data.
			 * @param {object}
			 *            [payment] - payment information.
			 * @return payment apply information array.
			 */
			function fetchOtApplyInfo(pymtRecord) {
				var pymAppliedItems = {};
				var transDate = pymtRecord.getValue('trandate');
				var period = pymtRecord.getValue('postingperiod');
				var subsidiary = pymtRecord.getValue('subsidiary');
				var total = pymtRecord.getValue('total');
				total = total ? total : pymtRecord.getValue('payment');
				// log.debug('total', total);
				var payCfi = pymtRecord.getValue('custbody_cseg_cn_cfi');
				// log.debug('payCfi', payCfi);
				if (!payCfi) {
					return pymAppliedItems;
				}
				var account = pymtRecord.getValue('account');
				// log.debug('account', account);
				// var acctType = search.lookupFields({
				// type : 'account',
				// id : account,
				// columns : 'accttype'
				// });
				if (!account) {
					return pymAppliedItems;
				}
				var accountRec = record.load({
					type : 'account',
					id : account
				});
				var acctType = accountRec.getValue('accttype');
				// log.debug('acctType', acctType);
				if (acctType != 'Bank') {
					return pymAppliedItems;
				}
				// 查询单据的
				var lineInfos = [];
				var item = {};
				item.pymtTranid = pymtRecord.id;
				item.subsidiary = subsidiary;
				item.period = period;
				item.transDate = transDate;
				item.cfi = payCfi;
				var _amount = total;
				if (pymtRecord.type == 'customerrefund'
						|| pymtRecord.type == 'cashrefund') {// 判断单据类型，如果为Customer
					// Refund和Cash
					// Refund则记录为负数
					_amount = _amount * -1;
				}
				item.amount = _amount.toFixed(2);
				// log.debug('item', item);
				lineInfos.push(item);
				pymAppliedItems[pymtRecord.id] = lineInfos;
				log.debug('pymAppliedItems', JSON.stringify(pymAppliedItems));
				return pymAppliedItems;
			}
			function updateCfiInfo(pymAppliedItems) {
				for ( var recId in pymAppliedItems) {
					var massOpsRecord;
					// log.debug('recId', recId);
					search
							.create(
									{
										type : 'customrecord_cn_cashflow_record_parent',
										filters : [
												'custrecord_mass_cfs_tranid',
												'equalto', recId ]
									})
							.run()
							.each(
									function(result) {
										massOpsRecord = record
												.load({
													type : 'customrecord_cn_cashflow_record_parent',
													id : result.id,
													isDynamic : true
												});
										return true;
									});
					// log.debug('massOpsRecord', massOpsRecord);
					if (massOpsRecord) {// 如果存在先移除原来的line
						clearSublist(massOpsRecord,
								'recmachcustrecord_mass_cfs_parent');
					} else {// 如果不存在则新增
						massOpsRecord = record.create({
							type : 'customrecord_cn_cashflow_record_parent',
							isDynamic : true
						});
						massOpsRecord.setValue({
							fieldId : 'custrecord_mass_cfs_tranid',
							value : commons.toNumber(recId)
						});
					}
					var pymAppliedItem = pymAppliedItems[recId];
					for (var i = 0; i < pymAppliedItem.length; i++) {
						// log.debug('pymAppliedItem', pymAppliedItem);
						massOpsRecord.selectNewLine({
							sublistId : 'recmachcustrecord_mass_cfs_parent'
						});
						if (pymAppliedItem[i].lineUniqueKey) {
							massOpsRecord
									.setCurrentSublistValue({
										sublistId : 'recmachcustrecord_mass_cfs_parent',
										fieldId : 'custrecord_cfs_line_unique_key',
										value : pymAppliedItem[i].lineUniqueKey
									});
						}
						if (pymAppliedItem[i].depositTranid) {
							massOpsRecord
									.setCurrentSublistValue({
										sublistId : 'recmachcustrecord_mass_cfs_parent',
										fieldId : 'custrecord_cfs_deposit_tranid',
										value : pymAppliedItem[i].depositTranid
									});
						}
						if (pymAppliedItem[i].pymtTranid) {
							massOpsRecord
									.setCurrentSublistValue({
										sublistId : 'recmachcustrecord_mass_cfs_parent',
										fieldId : 'custrecord_cfs_pymt_tranid',
										value : pymAppliedItem[i].pymtTranid
									});
						}
						if (pymAppliedItem[i].paidTranid) {
							massOpsRecord
									.setCurrentSublistValue({
										sublistId : 'recmachcustrecord_mass_cfs_parent',
										fieldId : 'custrecord_cfs_paid_tranid',
										value : pymAppliedItem[i].paidTranid
									});
						}
						massOpsRecord.setCurrentSublistValue({
							sublistId : 'recmachcustrecord_mass_cfs_parent',
							fieldId : 'custrecord_cfs_subsidiary',
							value : pymAppliedItem[i].subsidiary
						});
						massOpsRecord.setCurrentSublistValue({
							sublistId : 'recmachcustrecord_mass_cfs_parent',
							fieldId : 'custrecord_cfs_period',
							value : pymAppliedItem[i].period
						});
						// log.debug('pymAppliedItem[i].transDate',
						// pymAppliedItem[i].transDate);
						massOpsRecord.setCurrentSublistValue({
							sublistId : 'recmachcustrecord_mass_cfs_parent',
							fieldId : 'custrecord_cfs_trandate',
							value : pymAppliedItem[i].transDate
						});
						massOpsRecord.setCurrentSublistValue({
							sublistId : 'recmachcustrecord_mass_cfs_parent',
							fieldId : 'custrecord_cfs_item',
							value : pymAppliedItem[i].cfi
						});
						massOpsRecord.setCurrentSublistValue({
							sublistId : 'recmachcustrecord_mass_cfs_parent',
							fieldId : 'custrecord_cfs_amount',
							value : pymAppliedItem[i].amount
						});

						if (commons.makesure(pymAppliedItem[i].location)) {
							massOpsRecord
									.setCurrentSublistValue({
										sublistId : 'recmachcustrecord_mass_cfs_parent',
										fieldId : 'custrecord_cfs_location',
										value : pymAppliedItem[i].location
									});
						}
						if (commons.makesure(pymAppliedItem[i].department)) {
							massOpsRecord
									.setCurrentSublistValue({
										sublistId : 'recmachcustrecord_mass_cfs_parent',
										fieldId : 'custrecord_cfs_department',
										value : pymAppliedItem[i].department
									});
						}
						if (commons.makesure(pymAppliedItem[i].classification)) {
							massOpsRecord
									.setCurrentSublistValue({
										sublistId : 'recmachcustrecord_mass_cfs_parent',
										fieldId : 'custrecord_cfs_class',
										value : pymAppliedItem[i].classification
									});
						}
						massOpsRecord.commitLine({
							sublistId : 'recmachcustrecord_mass_cfs_parent'
						});
					}
					var id = massOpsRecord.save();
					log.debug('id', id);
				}
			}
			function clearSublist(_record, sublistId) {
				if (commons.makesure(sublistId)) {
					var lineCount = _record.getLineCount({
						sublistId : sublistId
					});
					for (var i = 0; i < lineCount; i++) {
						_record.removeLine({
							sublistId : sublistId,
							line : 0,
							ignoreRecalc : true
						});
					}
				}
			}
			/**
			 * Function definition to be triggered before record is loaded.
			 * 
			 * @param {Object}
			 *            scriptContext
			 * @param {Record}
			 *            scriptContext.newRecord - New record
			 * @param {string}
			 *            scriptContext.type - Trigger type
			 * @param {Form}
			 *            scriptContext.form - Current form
			 * @Since 2015.2
			 */
			function beforeLoad(scriptContext) {
				if (runtime.executionContext === runtime.ContextType.USER_INTERFACE) {
					if (scriptContext.type === 'create'
							|| scriptContext.type === 'edit'
							|| scriptContext.type === 'copy') {
						var currentRec = scriptContext.newRecord;
						// log.debug('beforeLoad.currentRec type' +
						// currentRec.type);
						if (currentRec.type === record.Type.VENDOR_PAYMENT
								|| currentRec.type === record.Type.DEPOSIT
								|| currentRec.type === record.Type.CUSTOMER_PAYMENT) {
							return;
						}
						var fileObj = file.load({
							path : 'src/component/ue/cn_filter_cfs.js'
						});
						// log.debug('ue_cn_cashflow.beforeLoad', fileObj.url);
						var initField = scriptContext.form.addField({
							id : 'custpage_initfield',
							label : 'initfield',
							type : 'INLINEHTML'// serverWidget.FieldType.INLINEHTML
						});
						initField.defaultValue = "<script type='text/javascript' src='"
								+ fileObj.url + "'></script>";
					}
				}
			}

			return {
				afterSubmit : afterSubmit
			// ,
			// beforeLoad : beforeLoad
			};

		});
