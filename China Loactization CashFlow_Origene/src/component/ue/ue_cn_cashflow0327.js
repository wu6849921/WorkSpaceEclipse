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
				'../../lib/wrapper/ns_wrapper_search' ],

		function(record, commons, file, runtime, formatter, search) {
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
				var triggerType = scriptContext.type;
				// log.debug('ue_cn_cashflow', 'scriptContext.type=' +
				// triggerType);

				if (triggerType === 'create' || triggerType === 'edit'
						|| triggerType === 'delete'
						|| triggerType === 'paybills'
						|| scriptContext.type === 'copy') {
					var currentRec = scriptContext.newRecord;
					// log.debug('ue_cn_cashflow', 'type=' + currentRec.type +
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
					} else if (currentRec.type === record.Type.JOURNAL_ENTRY) {
						pymAppliedItems = fetchJEApplyInfo(currentRec);
					} else if (currentRec.type === record.Type.DEPOSIT) {// 对Deposit特殊处理
						pymAppliedItems = fetchDepApplyInfo(currentRec);
					} else {// 其他record统一处理
						pymAppliedItems = fetchOtApplyInfo(currentRec);
					}
					if (pymAppliedItems) {
						updateCfiInfo(pymAppliedItems);
					}
				}
			}
			/**
			 * @desc Collect payment related data.
			 * @param {object}
			 *            [payment] - payment information.
			 * @return payment apply information array.
			 */
			function fetchPymtApplyInfo(pymtRecord) {
				var applyLineCount = pymtRecord.getLineCount({
					sublistId : 'apply'
				});
				var pymAppliedItems = {};
				var transDate = pymtRecord.getValue('trandate');
				// var transDate = formatter.formatDate(pymtRecord
				// .getValue('trandate'));
				var period = pymtRecord.getValue('postingperiod');
				var subsidiary = pymtRecord.getValue('subsidiary');
				var total = pymtRecord.getValue('total');
				var payCfi = pymtRecord.getValue('custbody_cseg_cn_cfi');
				// 1、到China book的exchangerate
				var accBokCount = pymtRecord.getLineCount({
					sublistId : 'accountingbookdetail'
				});
				var exchangeRate;
				for (var i = 0; i < accBokCount; i++) {
					// var accBook = pymtRecord.getSublistValue({
					// sublistId : 'accountingbookdetail',
					// fieldId : 'accountingbook',
					// line : i
					// });
					var exchangeRateN = pymtRecord.getSublistValue({
						sublistId : 'accountingbookdetail',
						fieldId : 'exchangerate',
						line : i
					});
					// log.debug('accBook', accBook);
					// log.debug('exchangeRateN', exchangeRateN);
					// if (accBook.indexOf('China') != -1) {
					if (exchangeRateN) {
						exchangeRate = exchangeRateN;
					}
					// }
				}
				// log.debug('exchangeRate', exchangeRate);

				if (!exchangeRate) {
					return pymAppliedItems;
				}
				var entityId = pymtRecord.getValue({
					fieldId : 'entity'
				});
				// log.debug('entityId', entityId);
				var entityType;
				search.create({
					type : 'entity',
					filters : [ [ 'internalid', 'anyof', entityId ] ]
				}).run().each(function(result) {
					entityType = result.recordType;
					return true;
				});
				// log.debug('entityType', entityType);

				if (!entityType || entityType != 'vendor') {
					return pymAppliedItems;
				}
				var entityCategory = search.lookupFields({
					type : search.Type.VENDOR,
					id : entityId,
					columns : [ 'category' ]
				});
				if (!commons.makesure(entityCategory)) {
					return pymAppliedItems;
				}
				entityCategory = entityCategory.category[0].value;
				// log.debug('entityCategory', entityCategory);

				if (entityCategory == '16') {// 如果category为employee则需要回查
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
						var trantype = pymtRecord.getSublistValue({
							sublistId : 'apply',
							fieldId : 'trantype',
							line : i
						});
						// log.debug('trantype', trantype);
						if (trantype != 'VendBill') {// 如果不是bill则不处理
							continue;
						}
						payAmount = payAmount * exchangeRate;
						// 封装同一个payment下的所有line
						// 2、判断vendor类型
						// 2、1vendor类型为employee则需要回查bill

						var billRecord = record.load({
							type : 'vendorbill',
							id : internalid
						});
						var expenseCount = billRecord.getLineCount({
							sublistId : 'expense'
						});
						var amounts = [];
						var amountTotal = 0;
						for (var j = 0; j < expenseCount; j++) {// 得到所有行的amount
							var amount = billRecord.getSublistValue({
								sublistId : 'expense',
								fieldId : 'amount',
								line : j
							});
							amounts.push(amount);
							amountTotal += amount;
						}
						// log.debug('expenseCount', expenseCount);
						for (var j = 0; j < expenseCount; j++) {// 生成行数据
							var item = {};
							item.lineUniqueKey = billRecord.getSublistValue({
								sublistId : 'expense',
								fieldId : 'line',
								line : j
							});
							item.pymtTranid = pymtRecord.id;
							item.paidTranid = internalid;
							item.subsidiary = subsidiary;
							item.period = period;
							item.transDate = transDate;
							item.cfi = billRecord.getSublistValue({
								sublistId : 'expense',
								fieldId : 'custcol_cseg_cn_cfi',
								line : j
							});
							if (!item.cfi) {
								continue;
							}
							var _amount = payAmount * amounts[j] / amountTotal;
							item.amount = _amount.toFixed(2);
							// log.debug('item', item);
							lineInfos.push(item);
						}
					}
					pymAppliedItems[pymtRecord.id] = lineInfos;
				} else {// 如果是供应商，则直接查询银行科目金额
					var item = {};
					var lineInfos = [];
					item.pymtTranid = pymtRecord.id;
					item.subsidiary = subsidiary;
					item.period = period;
					item.transDate = transDate;
					if (!payCfi) {
						return pymAppliedItems;
					}
					item.cfi = payCfi;
					var _amount = total * exchangeRate;
					item.amount = _amount.toFixed(2);
					lineInfos.push(item);
					pymAppliedItems[pymtRecord.id] = lineInfos;
				}
				log.debug('pymAppliedItems', JSON.stringify(pymAppliedItems));
				return pymAppliedItems;
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
				// var transDate = formatter.formatDate(pymtRecord
				// .getValue('trandate'));
				var period = pymtRecord.getValue('postingperiod');
				var subsidiary = pymtRecord.getValue('subsidiary');
				// 1、到China book的exchangerate
				var accBokCount = pymtRecord.getLineCount({
					sublistId : 'accountingbookdetail'
				});
				var exchangeRate;

				for (var i = 0; i < accBokCount; i++) {
					var exchangeRateN = pymtRecord.getSublistValue({
						sublistId : 'accountingbookdetail',
						fieldId : 'exchangerate',
						line : i
					});
					if (exchangeRateN) {
						exchangeRate = exchangeRateN;
					}
				}
				// log.debug('exchangeRate', exchangeRate);
				if (!exchangeRate) {
					return;
				}
				var lineInfos = [];
				for (var i = 0; i < applyLineCount; i++) {
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
					var cfi = pymtRecord.getSublistValue({
						sublistId : 'line',
						fieldId : 'custcol_cseg_cn_cfi',
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
					// var acctType = search.lookupFields({
					// type : 'account',
					// id : account,
					// columns : [ 'accttype' ]
					// });
					var accountRec = record.load({
						type : 'account',
						id : account
					});
					var acctType = accountRec.getValue('accttype');
					// log.debug('acctType', acctType);
					if (acctType != 'Bank') {
						continue;
					}
					var item = {};
					// log.debug('cfi', cfi);
					if (!cfi) {// 如果cfi不为空则记录line
						continue;
					}
					item.lineUniqueKey = line;
					item.pymtTranid = pymtRecord.id;
					item.subsidiary = subsidiary;
					item.period = period;
					item.transDate = transDate;
					item.cfi = cfi;
					var _amount = debitAmount ? debitAmount * exchangeRate
							: creditAmount * exchangeRate;
					item.amount = _amount.toFixed(2);
					// log.debug('item', item);
					lineInfos.push(item);
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
			function fetchDepApplyInfo(pymtRecord) {
				var applyLineCount = pymtRecord.getLineCount({
					sublistId : 'payment'
				});
				var otherCount = pymtRecord.getLineCount({
					sublistId : 'other'
				});
				var pymAppliedItems = {};
				var transDate = pymtRecord.getValue('trandate');
				// var transDate = formatter.formatDate(pymtRecord
				// .getValue('trandate'));
				var period = pymtRecord.getValue('postingperiod');
				var subsidiary = pymtRecord.getValue('subsidiary');
				var _cfi = pymtRecord.getValue('custbody_cseg_cn_cfi');
				// 1、到China book的exchangerate
				var accBokCount = pymtRecord.getLineCount({
					sublistId : 'accountingbookdetail'
				});
				var exchangeRate;

				for (var i = 0; i < accBokCount; i++) {
					var exchangeRateN = pymtRecord.getSublistValue({
						sublistId : 'accountingbookdetail',
						fieldId : 'exchangerate',
						line : i
					});
					if (exchangeRateN) {
						exchangeRate = exchangeRateN;
					}
				}
				// log.debug('exchangeRate', exchangeRate);
				if (!exchangeRate) {
					return;
				}
				var lineInfos = [];
				for (var i = 0; i < applyLineCount; i++) {
					var deposit = pymtRecord.getSublistValue({
						sublistId : 'payment',
						fieldId : 'deposit',
						line : i
					});
					// log.debug('deposit', deposit);
					if (!deposit) {
						return;
					}
					var amount = pymtRecord.getSublistValue({
						sublistId : 'payment',
						fieldId : 'paymentamount',
						line : i
					});
					var line = pymtRecord.getSublistValue({
						sublistId : 'payment',
						fieldId : 'lineid',
						line : i
					});
					var _id = pymtRecord.getSublistValue({
						sublistId : 'payment',
						fieldId : 'id',
						line : i
					});
					// log.debug('_id', _id);
					var cfi = search.lookupFields({
						type : search.Type.TRANSACTION,
						id : _id,
						columns : [ 'custbody_cseg_cn_cfi' ]
					});
					// log.debug('cfi', JSON.stringify(cfi));
					if (!commons.makesure(cfi.custbody_cseg_cn_cfi)) {
						continue;
					}
					cfi = cfi.custbody_cseg_cn_cfi[0].value;
					var item = {};
					// log.debug('cfi', cfi);
					item.lineUniqueKey = line;
					item.depositTranid = pymtRecord.id;
					item.pymtTranid = _id;
					item.subsidiary = subsidiary;
					item.period = period;
					item.transDate = transDate;
					item.cfi = cfi;
					var _amount = amount * exchangeRate;
					item.amount = _amount.toFixed(2);
					// log.debug('item', item);
					lineInfos.push(item);
				}
				if (_cfi) {// 对otherDeposit处理
					for (var i = 0; i < otherCount; i++) {
						var amount = pymtRecord.getSublistValue({
							sublistId : 'other',
							fieldId : 'amount',
							line : i
						});
						var line = pymtRecord.getSublistValue({
							sublistId : 'other',
							fieldId : 'line',
							line : i
						});

						var item = {};
						// log.debug('cfi', cfi);
						item.lineUniqueKey = line;
						item.depositTranid = pymtRecord.id;
						item.pymtTranid = pymtRecord.id;// other deposit支付本身
						item.subsidiary = subsidiary;
						item.period = period;
						item.transDate = transDate;
						item.cfi = _cfi;
						var _amount = amount * exchangeRate;
						item.amount = _amount.toFixed(2);
						// log.debug('item', item);
						lineInfos.push(item);
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
				var account = pymtRecord.getValue('account');
				var accBokCount = pymtRecord.getLineCount({
					sublistId : 'accountingbookdetail'
				});
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
				var exchangeRate;
				for (var i = 0; i < accBokCount; i++) {
					// var accBook = pymtRecord.getSublistValue({
					// sublistId : 'accountingbookdetail',
					// fieldId : 'accountingbook',
					// line : i
					// });
					var exchangeRateN = pymtRecord.getSublistValue({
						sublistId : 'accountingbookdetail',
						fieldId : 'exchangerate',
						line : i
					});
					// log.debug('accBook', accBook);
					// log.debug('exchangeRateN', exchangeRateN);
					// if (accBook.indexOf('China') != -1) {
					if (exchangeRateN) {
						exchangeRate = exchangeRateN;
					}
					// }
				}
				// log.debug('exchangeRate', exchangeRate);

				if (!exchangeRate) {
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
				var _amount = total * exchangeRate;
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
				afterSubmit : afterSubmit,
				beforeLoad : beforeLoad
			};

		});
