/**
 * Copyright © 2018, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NScriptName CN MR Cashflow Backfill
 * @NScriptId customscript_mr_cn_cfs_backfill
 * @NModuleScope TargetAccount
 */
define(
		[ 'N/search', 'N/log', 'N/record', 'N/runtime', 'N/format',
				'../../app/cashflow/app_cn_cashflow_pymt_ap_parser',
				'../../app/cashflow/app_cn_cashflow_pymt_ap_cacher',
				'../../app/helper/cashflow_helper', '../../lib/commons',
				'../../dao/cn_cashflow_collector_dao',
				'../../app/cashflow/app_cn_cashflow_je_collector',
				'../../app/cashflow/app_cn_cashflow_ar_collector',
				'../../app/cashflow/app_cn_cashflow_ap_collector' ],

		function(search, log, record, runtime, format, pymtParser, pymtCacher,
				helper, commons, collectorDao, journalCollector, arCollector,
				apCollector) {

			var collectors = [ apCollector, arCollector, journalCollector ];

			/**
			 * Marks the beginning of the Map/Reduce process and generates input
			 * data.
			 * 
			 * @typedef {Object} ObjectRef
			 * @property {number} id - Internal ID of the record instance
			 * @property {string} type - Record type id
			 * 
			 * @return {Array|Object|Search|RecordRef} inputSummary
			 * @since 2015.1
			 */
			function getInputData() {
				var scriptObj = runtime.getCurrentScript();
				var periodId = scriptObj.getParameter({
					name : 'custscript_cn_cashflow_backfill_filter'
				});
				var tranSearch = search.load({
					id : 'customsearch_cn_transaction_within_range'
				});
				updateFilterExpression(tranSearch, periodId);
				log.debug('getInputData', 'filterExp='
						+ tranSearch.filterExpression);
				return tranSearch;
			}

			function updateFilterExpression(savedSearch, periodId) {
				var dateFilter = [];
				// noneof type matches ue_cashflow_collect skipType
				// anyof type matches ue apply transaction type
				// this is NOT the target collected transaction
				// The target transaction will be filtered from each
				// collector->matches method
				var otherFilters = [
						[ "type", "noneof", "CustInvc", "VendBill", "SalesOrd",
								"CustCred", "VendCred", "ExpRept", "PurchOrd" ],
						"AND",
						[ "type", "anyof", "SalesOrd", "CashRfnd", "CashSale",
								"Check", "VendAuth", "CustCred", "CustDep",
								"CustRfnd", "Deposit", "ExpRept", "CustInvc",
								"Journal", "PurchOrd", "RtnAuth", "VendPymt",
								"VendCred", "VendBill", "CustPymt" ] ];
				if (!periodId) {
					log
							.error(
									'mr_cn_cashflow_backfill',
									'No period passed to current script, trigger transaction re-collected created within 10/8/2018 and 10/29/2018');
					var dateRange = getDateRangeStringExp();
					log.debug('getInputData', 'dateRange='
							+ JSON.stringify(dateRange));
					dateFilter = [
							[ "datecreated", "within",
									dateRange.fromDateString,
									dateRange.toDateString ], "AND" ];
				} else {
					log.debug('mr_cn_cashflow_backfill',
							'Collect transaction posted in periodId '
									+ periodId);
					dateFilter = [ [ "postingperiod", "abs", periodId ], "AND" ];
				}
				var filters = dateFilter.concat(otherFilters);
				log.debug('updateFilterExpression', 'filterExp=' + filters);
				savedSearch.filterExpression = filters;
			}

			function getDateRangeStringExp() {
				// Javascript counts months from 0 to 11
				// Oct is 9
				var fromDate = new Date(2018, 9, 8);
				var toDate = new Date(2018, 9, 29);
				var fromDateString = format.format({
					value : fromDate,
					type : format.Type.DATE,
					timezone : format.Timezone.ASIA_HONG_KONG
				});
				var toDateString = format.format({
					value : toDate,
					type : format.Type.DATE,
					timezone : format.Timezone.ASIA_HONG_KONG
				});
				return {
					fromDateString : fromDateString,
					toDateString : toDateString
				}
			}
			/**
			 * Executes when the map entry point is triggered and applies to
			 * each key/value pair.
			 * 
			 * @param {MapSummary}
			 *            context - Data collection containing the key/value
			 *            pairs to process through the map stage
			 * @param {String}
			 *            context example context as below { "type":
			 *            "mapreduce.MapContext", "isRestarted": false, "key":
			 *            "1", "value":
			 *            "{\"recordType\":null,\"id\":\"1\",\"values\":{\"GROUP(type)\":{\"value\":\"Journal\",\"text\":\"Journal\"},\"GROUP(internalid)\":{\"value\":\"5898\",\"text\":\"5898\"}}}" }
			 * @since 2015.1
			 */
			function map(context) {
				log.debug('mr_cn_cashflow_backfill', 'Enter map, context='
						+ JSON.stringify(context));
				var payload = JSON.parse(context.value);
				var tranId = payload.values['GROUP(internalid)'].value;
				var cashflowSearch = search.load({
					id : 'customsearch_cn_cfs_detail_within_range'
				});
				var filters = [ [
						[ "custrecord_cfs_pymt_tranid.internalid", "is", tranId ],
						"OR",
						[ "custrecord_cfs_deposit_tranid.internalid", "is",
								tranId ] ] ];
				cashflowSearch.filterExpression = filters;
				var columns = [ {
					"name" : "internalid",
					"join" : "CUSTRECORD_CFS_PYMT_TRANID",
					"summary" : "GROUP",
					"label" : "Payment Transaction ID"
				}, {
					"name" : "type",
					"join" : "CUSTRECORD_CFS_PYMT_TRANID",
					"summary" : "GROUP",
					"label" : "Payment Type"
				}, {
					"name" : "internalid",
					"join" : "CUSTRECORD_CFS_DEPOSIT_TRANID",
					"summary" : "GROUP",
					"label" : "Deposit Transaction ID"
				}, {
					"name" : "type",
					"join" : "CUSTRECORD_CFS_DEPOSIT_TRANID",
					"summary" : "GROUP",
					"label" : "Deposit Type"
				} ];
				cashflowSearch.columns = columns;
				// as column is grouped by transaction internal id, each
				// collected transaction should only return one grouped result
				var result = cashflowSearch.run().getRange({
					start : 0,
					end : 1
				}) || [];
				if (result.length === 1) {
					// transaction already been collected
					log
							.debug(
									'mr_cn_cashflow_backfill->map',
									'Transaction '
											+ tranId
											+ ' already collected, return immediately');
					return;
				} else {
					// trigger collected
					log.debug('mr_cn_cashflow_backfill->map', 'Transaction '
							+ tranId + ' not collected, start processing');
					var cashflow_params = prepareCashflowParams(payload);
					log.debug('map', 'cashflow_params='
							+ JSON.stringify(cashflow_params));
					triggerCashflowCollect(cashflow_params);
				}
			}
			/**
			 * @desc: This part is the same with ss_cn_cashflow_collect->execute
			 *        with minor changes
			 * @param params
			 */
			function triggerCashflowCollect(paramsObj) {
				log.audit('mr_cn_cashflow_backfill',
						'Enter triggerCashflowCollect, params='
								+ JSON.stringify(paramsObj));
				var type = paramsObj.type;
				var trantype = paramsObj.trantype;
				var tranid = paramsObj.tranid;
				var paymentApplyInfo = paramsObj.apply;
				if (commons.makesure(paramsObj.usecache)) {
					var recordarray = pymtCacher
							.getCacheRecord(paramsObj.apply);
					paymentApplyInfo = recordarray;
					pymtCacher.deleteCacheRecord(paramsObj.apply);
				}

				log.debug('triggerCashflowCollect params', 'type=' + type
						+ ', trantype=' + trantype + ', tranid=' + tranid);

				if (type === 'delete') {
					// If trigger type is delete, no need to call individual
					// collector
					return;
				}
				for ( var i in collectors) {
					if (collectors[i].matches(trantype)) {
						var result = collectors[i].collect(tranid,
								paymentApplyInfo, trantype);
						break;
					}
				}
				log.debug('before insertCashFlowReconciliation', 'result='
						+ JSON.stringify(result));
				if (commons.makecertain(result) && commons.isArray(result)
						&& result.length > 0) {
					collectorDao.insertCashFlowReconciliation(result);
				}
			}

			/**
			 * @desc: This following part is copy from ue_cn_cashflow
			 * @param payload
			 */
			function prepareCashflowParams(payload) {
				var transaction = payload.values;
				var transactionType = transaction['GROUP(type)'].value;
				var transactionId = transaction['GROUP(internalid)'].value;
				log.debug('mr_cn_cashflow_backfill',
						'prepareCashflowParams, transaction='
								+ JSON.stringify(transaction));
				var triggerType = 'create';
				var pymtAppliedInfo = getPymtApplyingOrAppliedInfo(
						transactionType, transactionId, triggerType);
				log.debug('mr_cn_cashflow_backfill', 'type=' + transactionType
						+ ',id=' + transactionId);
				var cashflow_params = {
					type : triggerType,
					trantype : transactionType,
					tranid : transactionId,
					apply : pymtAppliedInfo
				};
				var objstr = JSON.stringify(cashflow_params);
				var hasExceedMaxLimit = pymtCacher.hasExceedMaxLimit(objstr);
				if (hasExceedMaxLimit
						&& transaction.recordType === record.Type.VENDOR_PAYMENT) {
					log.debug('pymtAppliedInfo', JSON
							.stringify(pymtAppliedInfo));
					cashflow_params.usecache = true;
					var recordid = pymtCacher
							.cacheParamsToRecord(pymtAppliedInfo);
					log.debug('recordid', recordid);
					cashflow_params.apply = recordid;
				}
				log.audit('mr_cn_cashflow_backfill',
						'Exit prepareCashflowParams, cashflow_params='
								+ JSON.stringify(cashflow_params));
				return cashflow_params;
			}

			function getPymtApplyingOrAppliedInfo(transactionType,
					transactionId, triggerType) {
				if (transactionType === 'VendPymt') {
					var transRecord = record.load({
						type : record.Type.VENDOR_PAYMENT,
						id : transactionId
					});
					var pymtAppliedInfo = pymtParser.fetchPymtApplyInfo(
							transRecord, triggerType);
					log.debug('vendor payment', 'pymtAppliedInfo='
							+ JSON.stringify(pymtAppliedInfo));
				} else if (transactionType === 'CustPymt') {
					transRecord = record.load({
						type : record.Type.CUSTOMER_PAYMENT,
						id : transactionId
					});
					pymtAppliedInfo = helper.getAppliedTransactions({
						applyingRecord : transRecord,
						sublistId : 'credit'
					});
					log.debug('customer payment', 'pymtAppliedInfo='
							+ JSON.stringify(pymtAppliedInfo));
				}
				return pymtAppliedInfo;
			}

			/**
			 * Executes when the summarize entry point is triggered and applies
			 * to the result set.
			 * 
			 * @param {Summary}
			 *            summary - Holds statistics regarding the execution of
			 *            a map/reduce script
			 * @since 2015.1
			 */
			function summarize(summary) {
				log.debug('enter summarize', 'summary='
						+ JSON.stringify(summary));
				var errorSummary = [];
				summary.mapSummary.errors.iterator().each(function(key, error) {
					errorSummary.push({
						key : key,
						details : error
					});
					return true;
				});
				log.error('Summarize Error Count : ', errorSummary.length);
				log.error('Summarize Error Detail : ', JSON
						.stringify(errorSummary));
			}

			return {
				getInputData : getInputData,
				map : map,
				summarize : summarize
			};

		});
