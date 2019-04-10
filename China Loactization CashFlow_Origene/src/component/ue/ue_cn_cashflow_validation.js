/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope Public
 * @appliedtorecord invoice
 */
define(
		[ '../../lib/wrapper/ns_wrapper_runtime',
				'../../app/cashflow/app_cn_cashflow_validator',
				'../../lib/wrapper/ns_wrapper_error', '../../lib/commons',
				'N/config' ],
		function(runtime, validator, error, commons, config) {
			var api = {
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
				beforeSubmit : function(scriptContext) {
					var exeContext = runtime.executionContext;
					// ignore below validation if done by user interface client
					// script
					if (exeContext !== runtime.ContextType.USEREVENT
							|| scriptContext.type !== 'create') {
						return true;
					}

					var transactionForm = scriptContext.newRecord;
					// Subsidiary filter
					// second filter is journalWhiteList, this params only
					// applies for journal validation logic
					if (!toValidateTransactionLines(transactionForm)) {
						return true;
					}

					var result = false;
					if (validator.hasHeaderCfsItem(transactionForm)) {
						result = true;
					} else {
						// it only checks the line entries on invoice
						try {
							result = validateInvoiceLineEntries(transactionForm);
						} catch (ex) {
							throw ex;
						}
					}

					if (result === false) {
						throw error.Message.CashflowItemCannotBeEmpty;
					}
					return result;
				}
			};
			function validateInvoiceLineEntries(newRecord) {
				if (commons.makesure(newRecord)) {
					var lineCount = newRecord.getLineCount({
						sublistId : 'item'
					});
					if (lineCount <= 0) {
						return true;
					} else {
						// traverse each invoice line for CFS valiation
						for (var i = 0; i < lineCount; i++) {
							var cfsValue = newRecord.getSublistValue({
								sublistId : 'item',
								fieldId : 'custcol_cseg_cn_cfi',
								line : i
							});
							if (!commons.makesure(cfsValue)) {
								return false;
							}
						}
					}
					return true;
				} else {
					throw 'Empty new record';
				}
			}
			/**
			 * Do not use toValidateTransactionLines in
			 * app_cn_cashflow_validator Only handle UE in SI environment
			 * Because if server side script call RESTlet the full https URL and
			 * user credential needs to provide Detail information please refer
			 * to Suite Answer 51013
			 */
			function toValidateTransactionLines(newRecord) {
				if (!runtime.isOW()) {
					// call RESTLet in UE require full qualified URL (starts
					// with https) and user credential
					// calll config module instead
					var companyInfo = config.load({
						type : config.Type.COMPANY_INFORMATION
					});
					return companyInfo.getValue('custrecord_cn_cfi_mandatory');
				} else {
					return validator.isSubsidiaryRequireCfi(newRecord);
				}
			}
			api._validateInvoiceLineEntries = validateInvoiceLineEntries;
			api._toValidateTransactionLines = toValidateTransactionLines;
			return api;
		});
