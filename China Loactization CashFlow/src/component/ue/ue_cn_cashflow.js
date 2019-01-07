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
					// ��vendorpayment���⴦��
					if (currentRec.type === record.Type.VENDOR_PAYMENT) {
						// �õ�����
						pymAppliedItems = fetchPymtApplyInfo(currentRec);
						// д�����ݿ�
						// ��JE���⴦��
					} else if (currentRec.type === record.Type.JOURNAL_ENTRY) {
						pymAppliedItems = fetchJEApplyInfo(currentRec);
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
				// 1����China book��exchangerate
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
					var item = {};
					// log.debug('cfi', cfi);
					if (!cfi) {// ���cfi��Ϊ�����¼line
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
			function fetchOtApplyInfo(pymtRecord) {
				var pymAppliedItems = {};
				var transDate = pymtRecord.getValue('trandate');
				var period = pymtRecord.getValue('postingperiod');
				var subsidiary = pymtRecord.getValue('subsidiary');
				var total = pymtRecord.getValue('total');
				var payCfi = pymtRecord.getValue('custbody_cseg_cn_cfi');
				var account = pymtRecord.getValue('account');
				var accBokCount = pymtRecord.getLineCount({
					sublistId : 'accountingbookdetail'
				});
				// log.debug('account', account);
				if (account == '116' || !payCfi) {
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