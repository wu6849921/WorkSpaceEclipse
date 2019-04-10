/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
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
				log
						.debug('ue_cn_cashflow', 'scriptContext.type='
								+ triggerType);

				if (triggerType === 'create' || triggerType === 'edit'
						|| triggerType === 'paybills'
						|| scriptContext.type === 'copy') {
					var currentRec = scriptContext.newRecord;
					log.debug('currentRec Type', currentRec.type);

					if (currentRec.id === 0) {
						return;
					}
					var pymAppliedItems;
					// ��vendorpayment���⴦��
					if (currentRec.type === record.Type.VENDOR_PAYMENT) {
						// �õ�����
						pymAppliedItems = fetchPymtApplyInfo(currentRec);
						// д�����ݿ�
						// ��JE���⴦��
					} else if (currentRec.type === record.Type.JOURNAL_ENTRY) {
						pymAppliedItems = fetchJEApplyInfo(currentRec);
					} else if (currentRec.type === record.Type.DEPOSIT) {// ��Deposit���⴦��
						pymAppliedItems = fetchDepApplyInfo(currentRec);
					} else {// ����recordͳһ����
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
				// 1����China book��exchangerate
				// var accBokCount = pymtRecord.getLineCount({
				// sublistId : 'accountingbookdetail'
				// });

				// for (var i = 0; i < accBokCount; i++) {
				var exchangeRate = pymtRecord.getSublistValue({
					sublistId : 'accountingbookdetail',
					fieldId : 'exchangerate',
					line : 0
				});
				// log.debug('exchangeRateN', exchangeRateN);
				// if (accBook.indexOf('China') != -1) {
				if (!exchangeRate) {
					return pymAppliedItems;
				}
				// }
				// }
				// log.debug('exchangeRate', exchangeRate);
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

				if (entityCategory == '16') {// ���categoryΪemployee����Ҫ�ز�
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
						if (trantype != 'VendBill') {// �������bill�򲻴���
							continue;
						}
						payAmount = payAmount * exchangeRate;
						// ��װͬһ��payment�µ�����line
						// 2���ж�vendor����
						// 2��1vendor����Ϊemployee����Ҫ�ز�bill

						var billRecord = record.load({
							type : 'vendorbill',
							id : internalid
						});
						var expenseCount = billRecord.getLineCount({
							sublistId : 'expense'
						});
						var amounts = [];
						var amountTotal = 0;
						for (var j = 0; j < expenseCount; j++) {// �õ������е�amount
							var amount = billRecord.getSublistValue({
								sublistId : 'expense',
								fieldId : 'amount',
								line : j
							});
							amounts.push(amount);
							amountTotal += amount;
						}
						// log.debug('expenseCount', expenseCount);
						for (var j = 0; j < expenseCount; j++) {// ����������
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
				} else {// ����ǹ�Ӧ�̣���ֱ�Ӳ�ѯ���п�Ŀ���
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
				// �����Voiding Journal
				var createdFrom = pymtRecord.getValue('createdfrom');
				
				// 1����China book��exchangerate
				// var accBokCount = pymtRecord.getLineCount({
				// sublistId : 'accountingbookdetail'
				// });
				// for (var i = 0; i < accBokCount; i++) {
				var exchangeRate = pymtRecord.getSublistValue({
					sublistId : 'accountingbookdetail',
					fieldId : 'exchangerate',
					line : 0
				});
				if (!exchangeRate) {
					return pymAppliedItems;
				}
				// }
				// log.debug('exchangeRate', exchangeRate);
				// if (!exchangeRate) {
				// return ;
				// }
				var lineInfos = [];
				for (var i = 0; i < applyLineCount; i++) {
					var cfi = pymtRecord.getSublistValue({
						sublistId : 'line',
						fieldId : 'custcol_cseg_cn_cfi',
						line : i
					});
					if (!cfi) {// ���cfi��Ϊ�����¼line

						continue;
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
					var acctType = search.lookupFields({
						type : 'account',
						id : account,
						columns : [ 'type' ]
					});
					// log.debug('acctType', acctType);
					if (acctType != 'Bank') {
						continue;
					}
					var item = {};
					// log.debug('cfi', cfi);
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
				// 1����China book��exchangerate
				// var accBokCount = pymtRecord.getLineCount({
				// sublistId : 'accountingbookdetail'
				// });
				// for (var i = 0; i < accBokCount; i++) {
				// accountingbook����ֶ�ȡ����ֵ��Ӧ����ϵͳbug����ֻ��ȡ��һ��exchangerate
				// var accBook = pymtRecord.getSublistValue({
				// sublistId : 'accountingbookdetail',
				// fieldId : 'accountingbook',
				// line : i
				// });
				var exchangeRate = pymtRecord.getSublistValue({
					sublistId : 'accountingbookdetail',
					fieldId : 'exchangerate',
					line : 0
				});
				// log.debug('exchangeRateN', exchangeRateN);
				// if (accBook.indexOf('China') != -1) {
				if (!exchangeRate) {
					return pymAppliedItems;
				}
				// }
				// }
				// log.debug('exchangeRate', exchangeRate);
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
				if (_cfi) {// ��otherDeposit����
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
						item.pymtTranid = pymtRecord.id;// other deposit֧������
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
				// var accBokCount = pymtRecord.getLineCount({
				// sublistId : 'accountingbookdetail'
				// });
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
				// for (var i = 0; i < accBokCount; i++) {
				// accountingbook����ֶ�ȡ����ֵ��Ӧ����ϵͳbug����ֻ��ȡ��һ��exchangerate
				// var accBook = pymtRecord.getSublistValue({
				// sublistId : 'accountingbookdetail',
				// fieldId : 'accountingbook',
				// line : i
				// });
				var exchangeRate = pymtRecord.getSublistValue({
					sublistId : 'accountingbookdetail',
					fieldId : 'exchangerate',
					line : 0
				});
				// log.debug('exchangeRateN', exchangeRateN);
				// if (accBook.indexOf('China') != -1) {
				if (!exchangeRate) {
					return pymAppliedItems;
				}
				// }
				// }
				// log.debug('exchangeRate', exchangeRate);
				// ��ѯ���ݵ�
				var lineInfos = [];
				var item = {};
				item.pymtTranid = pymtRecord.id;
				item.subsidiary = subsidiary;
				item.period = period;
				item.transDate = transDate;
				item.cfi = payCfi;
				var _amount = total * exchangeRate;
				if (pymtRecord.type == 'customerrefund'
						|| pymtRecord.type == 'cashrefund') {// �жϵ������ͣ����ΪCustomer
					// Refund��Cash
					// Refund���¼Ϊ����
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
					if (massOpsRecord) {// ����������Ƴ�ԭ����line
						clearSublist(massOpsRecord,
								'recmachcustrecord_mass_cfs_parent');
					} else {// ���������������
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
			function beforeSubmit(scriptContext) {
				if (runtime.executionContext === runtime.ContextType.USER_INTERFACE) {
					if (scriptContext.type === 'create'
							|| scriptContext.type === 'edit'
							|| scriptContext.type === 'copy') {
						var currentRec = scriptContext.newRecord;
						// log.debug('beforeLoad.currentRec type' +
						// currentRec.type);
						if (currentRec.type !== 'journalentry') {
							return;
						}
						currentRec.setSublistValue({
							sublistId : 'line',
							fieldId : 'memo',
							line : 0,
							value : 'joetest'
						});
					}
				}
			}

			return {
				afterSubmit : afterSubmit
			// ,
			// beforeSubmit : beforeSubmit
			};

		});
