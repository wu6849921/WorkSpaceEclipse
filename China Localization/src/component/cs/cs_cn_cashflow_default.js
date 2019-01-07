/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope TargetAccount
 * @appliedtorecord many
 */
define(
		[ '../../lib/wrapper/ns_wrapper_search', '../../lib/commons',
				'../../lib/wrapper/ns_wrapper_runtime' ],
		function(search, commons, runtime) {
			function fieldChanged(context) {
				var userObj = runtime.getCurrentUser();
				var sublistId = context.sublistId;
				var fieldId = context.fieldId;
				// employee center role no need default cfs item, because this
				// role can not customize permission.
				if (userObj.roleCenter === 'EMPLOYEE'
						|| userObj.roleId === 'employee_center') {
					return;
				}
				if (sublistId === 'item' && fieldId === 'item') {
					itemChanged(context);
				} else if (sublistId === 'expense' && fieldId === 'category') {
					categoryChanged(context);
				} else if (sublistId === 'expense' && fieldId === 'account') {
					accountChanged(context);
				}

			}

			function itemChanged(context) {
				var currentRecord = context.currentRecord;
				var itemId = currentRecord.getCurrentSublistValue({
					sublistId : context.sublistId,
					fieldId : 'item'
				});
				if (!commons.makesure(itemId)) {
					// Init a new line or EndGroup
					return;
				}

				if (itemId < 0) {
					// Subtotal and Description line
					currentRecord.setCurrentSublistValue({
						sublistId : 'item',
						fieldId : 'custcol_cseg_cn_cfi',
						value : ''
					});
					return;
				}

				var itemLookups = search.lookupFields({
					type : search.Type.ITEM,
					id : itemId,
					columns : [ 'type',
					// subtype has translation issue
					// 'subtype',
					'custitem_cseg_cn_cfi', 'incomeaccount', 'expenseaccount',
							'assetaccount' ]
				});

				if (!itemLookups.type)
					// Ignore 'Shipping Item'
					return;
				var itemType = itemLookups.type[0].value;
				if (matchIgnoreItemType(itemType)) {
					currentRecord.setCurrentSublistValue({
						sublistId : 'item',
						fieldId : 'custcol_cseg_cn_cfi',
						value : ''
					});
				} else {
					if (matchDefaultFromItem(itemLookups)) {
						// Found cfs on item
						if (commons.makesure(itemLookups.custitem_cseg_cn_cfi)) {
							currentRecord
									.setCurrentSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_cseg_cn_cfi',
										value : itemLookups.custitem_cseg_cn_cfi[0].value
									});
							return;
						}
					}
					// Should default from account
					var tranType = currentRecord.type;
					var accountId = null;
					if (isSupportedPayableTranTypes(tranType)) {
						if (itemType === 'InvtPart' || itemType === 'Assembly')
							accountId = itemLookups.assetaccount[0].value;
						else
							accountId = itemLookups.expenseaccount[0].value;
					} else if (isSupportedReceivableTranTypes(tranType)) {
						accountId = itemLookups.incomeaccount[0].value;
					} else {
						// None supported trantypes
					}
					if (commons.makecertain(accountId)) {
						var accountLookups = search.lookupFields({
							type : search.Type.ACCOUNT,
							id : accountId,
							columns : [ 'custrecord_n112_cseg_cn_cfi' ]
						});
						if (commons
								.makesure(accountLookups.custrecord_n112_cseg_cn_cfi)) {
							currentRecord
									.setCurrentSublistValue({
										sublistId : 'item',
										fieldId : 'custcol_cseg_cn_cfi',
										value : accountLookups.custrecord_n112_cseg_cn_cfi[0].value
									});
							return;
						}
					}
					currentRecord.setCurrentSublistValue({
						sublistId : 'item',
						fieldId : 'custcol_cseg_cn_cfi',
						value : ''
					});
				}
			}

			function categoryChanged(context) {
				var currentRecord = context.currentRecord;
				var categoryId = currentRecord.getCurrentSublistValue({
					sublistId : context.sublistId,
					fieldId : 'category'
				});
				if (!commons.makesure(categoryId)) {
					// Init a new line
					return;
				}

				var tranType = currentRecord.type;
				if (tranType === 'expensereport') {
					var categoryLookups = search.lookupFields({
						type : search.Type.EXPENSE_CATEGORY,
						id : categoryId,
						columns : [ 'account' ]
					});
					var accountId = categoryLookups.account[0].value;
					defaultExpenseCFS(accountId, currentRecord);
				}
			}

			function accountChanged(context) {
				var currentRecord = context.currentRecord;
				var accountId = currentRecord.getCurrentSublistValue({
					sublistId : context.sublistId,
					fieldId : 'account'
				});
				if (!commons.makesure(accountId)) {
					// Init a new line
					return;
				}
				defaultExpenseCFS(accountId, currentRecord);
			}

			function defaultExpenseCFS(accountId, currentRecord) {
				var accountLookups = search.lookupFields({
					type : search.Type.ACCOUNT,
					id : accountId,
					columns : [ 'custrecord_n112_cseg_cn_cfi' ]
				});
				if (commons
						.makesure(accountLookups.custrecord_n112_cseg_cn_cfi)) {
					currentRecord
							.setCurrentSublistValue({
								sublistId : 'expense',
								fieldId : 'custcol_cseg_cn_cfi',
								value : accountLookups.custrecord_n112_cseg_cn_cfi[0].value
							});
				} else {
					currentRecord.setCurrentSublistValue({
						sublistId : 'expense',
						fieldId : 'custcol_cseg_cn_cfi',
						value : ''
					});
				}
			}

			function matchIgnoreItemType(itemType) {
				var ignoreItemTypeArr = [ 'Discount', 'Markup', 'Group',
						'EndGroup', 'Subtotal', 'Description', 'Payment' // Payment
																			// Item
																			// has
																			// incomeaccount
				];
				for ( var i in ignoreItemTypeArr) {
					if (ignoreItemTypeArr[i] === itemType)
						// Found match item type in ignore array
						return true;
				}
				return false;
			}

			/**
			 * Check if current item matches item types that should default from
			 * Item CFS directly. If current item has both income account and
			 * expense account, then it should default from account directly.
			 */
			function matchDefaultFromItem(item) {
				if (commons.makesure(item.incomeaccount)
						&& commons.makesure(item.expenseaccount))
					return false;
				else
					return true;
			}

			function isSupportedPayableTranTypes(tranType) {
				var payableTranTypeArr = [ 'purchaseorder',
						'vendorreturnauthorization', 'vendorbill',
						'vendorcredit', 'check' ];
				for ( var i in payableTranTypeArr) {
					if (payableTranTypeArr[i] === tranType)
						return true;
				}
				return false;
			}

			function isSupportedReceivableTranTypes(tranType) {
				var receivableTranTypeArr = [ 'salesorder',
						'returnauthorization', 'invoice', 'creditmemo',
						'cashsale', 'cashrefund' ];
				for ( var i in receivableTranTypeArr) {
					if (receivableTranTypeArr[i] === tranType)
						return true;
				}
				return false;
			}

			return {
				fieldChanged : fieldChanged
			};
		});
