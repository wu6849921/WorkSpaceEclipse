/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope TargetAccount
 */
define(
		[ '../../dao/cn_cashflow_dao', '../../lib/wrapper/ns_wrapper_runtime',
				'../../lib/commons', '../helper/cashflow_helper',
				'../../lib/wrapper/ns_wrapper_record',
				'../../dao/cn_subsidiary_dao',
				'../../lib/wrapper/ns_wrapper_format' ],
		function(cashflowDao, runtime, commons, cashflowHelper, record,
				subsidiaryDao, format) {

			var recordTypeWhiteList = [ record.Type.JOURNAL_ENTRY,
					record.Type.INTER_COMPANY_JOURNAL_ENTRY,
					'advintercompanyjournalentry', 'Journal' ];

			/*
			 * @desc Collect cash flow related data for Journal Entry,
			 * Intercompany Journal Entries and Advanced Intercompany Journal.
			 */
			function collect(tranid) {
				log.debug('app_cn_cashflow_je_collector.collect', 'tranid='
						+ tranid);

				if (!commons.isNumber(tranid)) {
					var tranidNum = Number(tranid);
					var isTranIdNumber = commons.isNumber(tranidNum);
					if (isTranIdNumber === false) {
						log.debug('je_collector', 'isTranIdNumber: '
								+ isTranIdNumber);
						return;
					}

				}

				var resultset = fetchJournal(tranid);
				log.debug('app_cn_cashflow_je_collector.resultset', resultset);

				if (resultset.length === 0)
					return;

				if (resultset[0].getValue('isreversal')) {
					return collectVoidJournal(resultset);
				}

				return collectJournal(resultset);
			}

			function collectJournal(resultset) {
				// A variable to store collected reconciliation lines.
				var reconciliationEntries = [];
				var debitEntries = [];
				var creditEntries = [];
				var fromSubsidiary = resultset[0].getValue('subsidiary');
				var toSubsidiary;
				for ( var i in resultset) {
					if (runtime.isOW()) {
						toSubsidiary = resultset[i].getValue('subsidiary');
						if (toSubsidiary !== fromSubsidiary) {
							collectSingleSubsidiary(resultset[0].id,
									reconciliationEntries, debitEntries,
									creditEntries);
							debitEntries = [];
							creditEntries = [];
							fromSubsidiary = toSubsidiary;
						}
					}
					if (commons.hasField(resultset[i], 'debitamount')) {
						debitEntries.push(resultset[i]);
					}
					if (commons.hasField(resultset[i], 'creditamount')) {
						creditEntries.push(resultset[i]);
					}
				}
				collectSingleSubsidiary(resultset[0].id, reconciliationEntries,
						debitEntries, creditEntries);
				return reconciliationEntries;
			}

			function collectVoidJournal(resultset) {
				log.debug('app_cn_cashflow_je_collector.collectVoidJournal');

				var loadedJournal = record.load({
					type : 'journalentry',
					id : resultset[0].id
				});

				var createdFromId = loadedJournal.getValue({
					fieldId : 'createdfrom'
				});

				if (!commons.makesure(createdFromId)) {
					log
							.error('app_cn_cashflow_je_collector.loadedJournal, createdfrom field is empty');
					return;
				}

				var collectedDetailResults = cashflowDao
						.fetchCollectedCashflowStatementEntries({
							tranid : createdFromId
						});
				log.debug(
						'app_cn_cashflow_je_collector.collectedDetailResults',
						collectedDetailResults);
				var reconciliationEntries = [];

				for ( var i in collectedDetailResults) {
					doCollect(reconciliationEntries, {
						payingTran : resultset[0].id,
						subsidiary : collectedDetailResults[i]
								.getValue('custrecord_cfs_subsidiary'),
						postingperiod : resultset[0].getValue('postingperiod'),
						trandate : resultset[0].getValue('trandate'),
						cashflowitem : collectedDetailResults[i]
								.getValue('custrecord_cfs_item'),
						cashamount : collectedDetailResults[i]
								.getValue('custrecord_cfs_amount')
								* -1,
						location : collectedDetailResults[i]
								.getValue('custrecord_cfs_location'),
						department : collectedDetailResults[i]
								.getValue('custrecord_cfs_department'),
						classification : collectedDetailResults[i]
								.getValue('custrecord_cfs_class')
					});
				}
				log.debug('app_cn_cashflow_je_collector.reconciliationEntries',
						reconciliationEntries);
				return reconciliationEntries;
			}

			function collectSingleSubsidiary(tranid, reconciliationEntries,
					debitEntries, creditEntries) {
				var bankEntries;
				var oppsiteEntries;

				if (cashflowHelper.hasBankAccount(debitEntries)) {
					if (cashflowHelper.hasBankAccount(creditEntries)) {
						log
								.audit('Found Invalid Data',
										'both debit and credit entries have bank accounts');
						return;
					} else {
						bankEntries = debitEntries;
						oppsiteEntries = creditEntries;
					}
				} else {
					if (cashflowHelper.hasBankAccount(creditEntries)) {
						bankEntries = creditEntries;
						oppsiteEntries = debitEntries;
					} else {
						log
								.audit('Found Invalid Data',
										'neither debit nor credit entries have bank accounts');
						return;
					}
				}

				if (hashMultiDebitAndCredit(bankEntries, oppsiteEntries)) {
					log
							.audit('Found Invalid Data',
									'found multiple debit entries and multiple credit entries');
					return;
				}

				if (hasSingleBankAccount(bankEntries)) {
					collectWithSingleBankAccount(tranid, reconciliationEntries,
							bankEntries, oppsiteEntries);
				} else {
					collectWithMultiBankAccounts(tranid, reconciliationEntries,
							bankEntries, oppsiteEntries);
				}
			}

			/*
			 * @desc Check if there are multi debits and multi credits.
			 */
			function hashMultiDebitAndCredit(bankEntries, oppsiteEntries) {
				return bankEntries.length > 1 && oppsiteEntries.length > 1;
			}

			function hasSingleBankAccount(bankEntries) {
				return bankEntries.length === 1;
			}

			/*
			 * @desc Commit cash flow entries to custom record.
			 */
			function collectWithSingleBankAccount(tranid,
					reconciliationEntries, bankEntries, oppsiteEntries) {
				for ( var i in oppsiteEntries) {
					doCollect(reconciliationEntries, {
						payingTran : tranid,
						subsidiary : cashflowHelper
								.getCurrentSubsidiary(oppsiteEntries[i]
										.getValue('subsidiary')),
						postingperiod : oppsiteEntries[i]
								.getValue('postingperiod'),
						trandate : oppsiteEntries[i].getValue('trandate'),
						cashflowitem : oppsiteEntries[i]
								.getValue('custcol_cseg_cn_cfi'),
						cashamount : cashamount(bankEntries[0]
								.getValue('amount'), oppsiteEntries[i]
								.getValue('amount'), oppsiteEntries[i]
								.getValue('taxamount')),
						location : oppsiteEntries[i].getValue('location'),
						department : oppsiteEntries[i].getValue('department'),
						classification : oppsiteEntries[i].getValue('class')
					});
				}
			}

			function collectWithMultiBankAccounts(tranid,
					reconciliationEntries, bankEntries, oppsiteEntries) {
				for ( var i in bankEntries) {
					if (cashflowHelper.isBankAccount(bankEntries[i])) {
						doCollect(reconciliationEntries, {
							payingTran : tranid,
							subsidiary : cashflowHelper
									.getCurrentSubsidiary(oppsiteEntries[0]
											.getValue('subsidiary')),
							postingperiod : oppsiteEntries[0]
									.getValue('postingperiod'),
							trandate : oppsiteEntries[0].getValue('trandate'),
							cashflowitem : oppsiteEntries[0]
									.getValue('custcol_cseg_cn_cfi'),
							cashamount : cashamount(bankEntries[i]
									.getValue('amount'), bankEntries[i]
									.getValue('amount'), bankEntries[i]
									.getValue('taxamount')),
							location : oppsiteEntries[0].getValue('location'),
							department : oppsiteEntries[0]
									.getValue('department'),
							classification : oppsiteEntries[0]
									.getValue('class')
						});
					}
				}
			}

			function cashamount(bankamount, amount, taxamount) {
				if (commons.makesure(taxamount))
					return commons.toAbsNumber(amount)
							+ commons.toAbsNumber(taxamount);
				else
					return commons.toAbsNumber(amount);
			}

			function fetchJournal(tranid) {
				var resultset = cashflowDao.fetchTransactionEntries({
					ids : tranid
				});
				// constraints: journal should have less than 1000 lines
				return resultset.getRange({
					start : 0,
					end : 1000
				}) || [];
			}

			/*
			 * @desc Commit cash flow entries to custom record. @param {Object}
			 * entry - The final revised data to be committed to custom record.
			 */
			function doCollect(reconciliationEntries, entry) {
				log.debug('app_cn_cashflow_je_collector.doCollect', entry);
				reconciliationEntries.push({
					pymtTranid : entry.payingTran,
					subsidiary : entry.subsidiary,
					trandate : format.parseDate(entry.trandate),
					period : entry.postingperiod,
					item : entry.cashflowitem,
					amount : entry.cashamount,
					location : entry.location,
					department : entry.department,
					classification : entry.classification
				});
			}

			function matches(tranType) {
				return recordTypeWhiteList.indexOf(tranType) !== -1;
			}

			return {
				collect : collect,
				matches : matches
			};

		});
