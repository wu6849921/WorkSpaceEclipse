/**
 * Copyright 漏 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 * @appliedtorecord many
 * @NScriptId _cs_cn_cashflow_default
 * @NDeploymentId
 */
define([ '../../lib/wrapper/ns_wrapper_search', '../../lib/commons',
		'../../lib/wrapper/ns_wrapper_runtime', 'N/record' ],
		function(search, commons, runtime, record) {
			function fieldChanged(context) {
				var currentRecord = context.currentRecord;
				var userObj = runtime.getCurrentUser();
				var sublistId = context.sublistId;
				var fieldId = context.fieldId;
				// employee center role no need default cfs item, because this
				// role can not customize permission.
				if (userObj.roleCenter === 'EMPLOYEE'
						|| userObj.roleId === 'employee_center') {
					return;
				}
				if (fieldId === 'custitem_itemclassify') {
					var itemClass = currentRecord.getValue({
						fieldId : fieldId
					});
					if (!itemClass) {
						return;
					}
					var cfiIn = '';
					var cfiOut = '';
					search.create(
							{
								type : 'customrecord_tn_itemmapcfi',
								filters : [ 'custrecord_tn_itemclass', 'is',
										itemClass ],
								columns : [ 'custrecord_tn_map_cfiin',
										'custrecord_tn_map_cfiout' ]
							}).run().each(function(result) {
						cfiIn = result.getValue({
							name : 'custrecord_tn_map_cfiin'
						});
						cfiOut = result.getValue({
							name : 'custrecord_tn_map_cfiout'
						});
						return true;
					});
					currentRecord.setValue({
						fieldId : 'custitem_tn_cashflowitemin',
						value : cfiIn
					});
					currentRecord.setValue({
						fieldId : 'custitem_tn_cashflowitemout',
						value : cfiOut
					});
				}
				if (sublistId === 'item' && fieldId === 'item') {
					var itemId = currentRecord.getCurrentSublistValue({
						sublistId : sublistId,
						fieldId : fieldId
					});
					if (!itemId) {
						return;
					}
					if (currentRecord.type == 'vendorbill'
							|| currentRecord.type == 'purchaseorder'
							|| currentRecord.type == 'check'
							|| currentRecord.type == 'creditcardcharge'
							|| currentRecord.type == 'creditcardrefund') {
						cashFlowItemFieldId = 'custitem_tn_cashflowitemout';
					} else if (currentRecord.type == 'salesorder'
							|| currentRecord.type == 'invoice'
							|| currentRecord.type == 'cashsale'
							|| currentRecord.type == 'cashrefund') {
						cashFlowItemFieldId = 'custitem_tn_cashflowitemin';
					}
					var cashFlowItem = search.lookupFields({
						type : search.Type.ITEM,
						id : itemId,
						columns : cashFlowItemFieldId
					});
					// alert(JSON.stringify(cashFlowItem));
					// alert(JSON.stringify(cashFlowItem[cashFlowItemFieldId]));
					if (!commons.makesure(cashFlowItem[cashFlowItemFieldId])) {
						return;
					}
					// alert(JSON.stringify(cashFlowItem));
					cashFlowItem = cashFlowItem[cashFlowItemFieldId][0].value;
					currentRecord.setCurrentSublistValue({
						sublistId : sublistId,
						fieldId : 'custcol_cseg_cn_cfi',
						value : cashFlowItem
					});
				}
				if (sublistId == 'expense'
						&& (fieldId == 'category' || fieldId == 'account')) {
					currentRecord.setCurrentSublistValue({
						sublistId : sublistId,
						fieldId : 'custcol_cseg_cn_cfi',
						value : '4'
					});
				}
			}
			/**
			 * Validation function to be executed when sublist line is
			 * committed.
			 * 
			 * @param {Object}
			 *            scriptContext
			 * @param {Record}
			 *            scriptContext.currentRecord - Current form record
			 * @param {string}
			 *            scriptContext.sublistId - Sublist name
			 * 
			 * @returns {boolean} Return true if sublist line is valid
			 * 
			 * @since 2015.2
			 */
			function validateLine(context) {
				var currentRecord = context.currentRecord;
				var userObj = runtime.getCurrentUser();
				var sublistId = context.sublistId;
				// employee center role no need default cfs item, because this
				// role can not customize permission.
				if (userObj.roleCenter === 'EMPLOYEE'
						|| userObj.roleId === 'employee_center') {
					return true;
				}
				// alert(sublistId);
				if (sublistId == 'line') {
					var subsidiary = currentRecord.getValue({
						fieldId : 'subsidiary'
					});
					var country = search.lookupFields({
						type : search.Type.SUBSIDIARY,
						id : subsidiary,
						columns : 'country'
					});
					// alert(JSON.stringify(country));
					// alert(JSON.stringify(cashFlowItem[cashFlowItemFieldId]));
					if (!commons.makesure(country.country)) {
						return;
					}
					country = country.country[0].value;
					if (country != 'CN') {
						return true;
					}
					var accountId = currentRecord.getCurrentSublistValue({
						sublistId : sublistId,
						fieldId : 'account'
					});
					var cfi = currentRecord.getCurrentSublistValue({
						sublistId : sublistId,
						fieldId : 'custcol_cseg_cn_cfi'
					});
					if (cfi) {
						return true;
					}
					var accNumber = search.lookupFields({
						type : search.Type.ACCOUNT,
						id : accountId,
						columns : 'number'
					});
					accNumber = accNumber.number;
					// log.debug('accNumber', accNumber);
					if (accNumber.substring(0, 4) == '1001'
							|| accNumber == '13000000') {
						alert('请填入现金流量表！');
						return false;
					}
				}
				return true;
			}
			return {
				fieldChanged : fieldChanged,
				validateLine : validateLine
			};
		});
