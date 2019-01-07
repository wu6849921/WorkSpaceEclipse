/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 18 Nov 2016 Han Dong
 * 
 */

var common = new trigger.common();

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm}
 *            form Current form
 * @param {nlobjRequest}
 *            request Request object
 * @returns {Void}
 */
function userEventBeforeLoad(type, form, request) {
	try {
		var BudgetId = nlapiGetRecordId();
		if (BudgetId) {
			if (type == 'view') {
				form.setScript('customscript_tn_sl_budget');
				form.addButton('custpage_btn_budgetprint', 'Print Budget',
						'redirectToBudgetPrint(' + BudgetId + ')');
			}
		}
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'userEventBeforeLoad', ex);
		common.sendErrorEmail('mark.han@triggerasia.com', 'Riviera Events',
				'TN_UE_Budget', 'userEventBeforeLoad', ex);
	}
}

function userEventBeforeSubmit(type) {
	try {
		if (type == 'create' || type == 'edit') {
			var itemCount = nlapiGetLineItemCount('item');
			var proMng = 0;
			var showMng = 0;
			var custItemType = '';
			var lineTotalS = 0;
			var lineTotalP = 0;
			var sumTotalP = 0;
			if (itemCount >= 1) {
				for (var i = 1; i <= itemCount; i++) {
					var itemType = nlapiGetLineItemValue('item', 'itemtype', i);
					if (itemType != 'Group' || itemType != 'EndGroup'
							|| itemType != 'Markup' || itemType != 'Subtotal') {
						custItemType = nlapiGetLineItemValue('item',
								'custcol_tn_item_type', i);
						lineTotalS = common
								.convertValToNum(nlapiGetLineItemValue('item',
										'amount', i));
						if (custItemType == '1') {
							proMng += lineTotalS;
						} else if (custItemType == '2') {
							showMng += lineTotalS;
						}
						lineTotalP = common
								.convertValToNum(nlapiGetLineItemValue('item',
										'custcol_tn_total_p', i));
						sumTotalP += lineTotalP;
					}
				}
			}
			var totalMng = proMng + showMng;
			var proMngPercent = 0;
			var showMngPercent = 0;
			if (totalMng > 0) {
				proMngPercent = common.convertNumToTaxRate((proMng / totalMng)
						.toFixed(4));
				showMngPercent = common
						.convertNumToTaxRate((showMng / totalMng).toFixed(4));
			}
			nlapiSetFieldValue('custbody_tn_pro_mng_base', proMngPercent);
			nlapiSetFieldValue('custbody_tn_show_mng_base', showMngPercent);

			var summaryTotal = common
					.convertValToNum(nlapiGetFieldValue('total'));
			if (summaryTotal) {
				var sysDiscountPercentage = 0
				// var sysDiscount =
				// common.convertValToNum(nlapiGetFieldValue('discountrate'));
				var sysDiscount = nlapiGetFieldValue('discountrate');
				if (sysDiscount === null || sysDiscount.trim() === '') {
					nlapiSetFieldValue('custbody_tn_discount_percentage', '');
					nlapiSetFieldValue('custbody_tn_discounted_margin', '');
					nlapiSetFieldValue('custbody_tn_discounted_margin_per', '');
				} else {
					sysDiscount = common.convertValToNum(sysDiscount);
					if (!sysDiscount)
						sysDiscount = 0;
					var sysDiscountABS = Math.abs(sysDiscount);
					var custDiscountPercentage = sysDiscountABS
							/ (summaryTotal + sysDiscountABS);
					var custDiscountedMargin = summaryTotal / 1.06 - sumTotalP;
					var custDiscountedMarginPercentage = custDiscountedMargin
							/ summaryTotal;
					nlapiSetFieldValue('custbody_tn_discount_percentage',
							common.convertNumToTaxRate(custDiscountPercentage));
					nlapiSetFieldValue('custbody_tn_discounted_margin', common
							.formatFloatValue(custDiscountedMargin, 2));
					nlapiSetFieldValue(
							'custbody_tn_discounted_margin_per',
							common
									.convertNumToTaxRate(custDiscountedMarginPercentage));
				}

			}

			var relatedOpp = nlapiGetFieldText('opportunity');
			var budgetSeq = '';

			var myDate = new Date();
			var currentMonth = myDate.getMonth() + 1;
			var currentYear = myDate.getFullYear();
			var currentDate = myDate.getDate();

			if (relatedOpp) {
				budgetSeq = 'BUD: ' + relatedOpp;
			} else {
				budgetSeq = 'BUD: ' + 'NO RELATED OPPORTUNITY' + ' '
						+ currentYear + '-' + currentMonth + '-' + currentDate;
			}
			nlapiSetFieldValue('tranid', budgetSeq);
		}
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'userEventBeforeSubmit', ex);
		common.sendErrorEmail('mark.han@triggerasia.com', 'Riviera Events',
				'TN_UE_Budget', 'userEventBeforeSubmit', ex);
	}
}
