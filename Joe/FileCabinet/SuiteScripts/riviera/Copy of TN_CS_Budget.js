/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 30 Nov 2016 Han Dong update:10-Jan-2017
 */
var common = new trigger.common();

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum) {
	try {
		if (type == 'item') {
			var totalP = 'custcol_tn_total_p';
			var totalS = 'amount';
			var costP = 'custcol_tn_cost_p';
			var costS = 'rate';
			var quantityP = 'custcol_tn_quantity_p';
			var paid = 'custcol_tn_paid'; // add by joe 20180108
			var balance = 'custcol_tn_balance';
			if (name == paid) {// balance=totalP-paid
				var totalP_val = common
						.convertValToNum(nlapiGetCurrentLineItemValue('item',
								totalP));
				var paid_val = common
						.convertValToNum(nlapiGetCurrentLineItemValue('item',
								paid));
				var percentage_val = '';
				if (totalP_val >= 0 && paid_val >= 0) {
					percentage_val = totalP_val - paid_val;
					nlapiSetCurrentLineItemValue('item', 'custcol_tn_balance',
							percentage_val, false);
				}
			}
			if (name == totalP) {
				var totalP_val = common
						.convertValToNum(nlapiGetCurrentLineItemValue('item',
								totalP));
				var totalS_val = common
						.convertValToNum(nlapiGetCurrentLineItemValue('item',
								totalS));
				var quantityP_val = common
						.convertValToNum(nlapiGetCurrentLineItemValue('item',
								quantityP));
				var percentage_val = '';
				if (totalP_val >= 0 && totalS_val >= 0) {
					percentage_val = totalP_val == 0 ? 0 : common
							.convertNumToTaxRate(totalS_val / totalP_val - 1);
					nlapiSetCurrentLineItemValue('item',
							'custcol_tn_percentage', percentage_val, false);
					// costP_val = quantityP_val == 0 ? 0 : totalP_val /
					// quantityP_val;
					// nlapiSetCurrentLineItemValue('item', costP, costP_val,
					// false);
				}
			}

			if (name == totalS) {
				var totalP_val = common
						.convertValToNum(nlapiGetCurrentLineItemValue('item',
								totalP));
				var totalS_val = common
						.convertValToNum(nlapiGetCurrentLineItemValue('item',
								totalS));
				var percentage_val = '';
				if (totalP_val >= 0 && totalS_val >= 0) {
					percentage_val = totalP_val == 0 ? 0 : common
							.convertNumToTaxRate(totalS_val / totalP_val - 1);
					nlapiSetCurrentLineItemValue('item',
							'custcol_tn_percentage', percentage_val, false);
				}
			}

			// when quantity(s) changed, change percentage as well
			if (name == 'quantity') {
				var totalP_val = common
						.convertValToNum(nlapiGetCurrentLineItemValue('item',
								totalP));
				var totalS_val = common
						.convertValToNum(nlapiGetCurrentLineItemValue('item',
								totalS));
				var percentage_val = '';
				if (totalP_val >= 0 && totalS_val >= 0) {
					percentage_val = totalP_val ? common
							.convertNumToTaxRate(totalS_val / totalP_val - 1)
							: 0;
					nlapiSetCurrentLineItemValue('item',
							'custcol_tn_percentage', percentage_val, false);
				}
			}

			if (name == costP) {
				var costP_val = common
						.convertValToNum(nlapiGetCurrentLineItemValue('item',
								costP));
				var quantityP_val = common
						.convertValToNum(nlapiGetCurrentLineItemValue('item',
								quantityP));
				var totalP_val = 0;
				if (costP_val >= 0 && quantityP_val >= 0) {
					totalP_val = costP_val * quantityP_val;
					nlapiSetCurrentLineItemValue('item', totalP, totalP_val,
							true);
				}
			}

			if (name == costS) {
				var costP_val = common
						.convertValToNum(nlapiGetCurrentLineItemValue('item',
								costP));
				var quantityP_val = common
						.convertValToNum(nlapiGetCurrentLineItemValue('item',
								quantityP));
				var totalP_val = 0;
				if (costP_val >= 0 && quantityP_val >= 0) {
					totalP_val = costP_val * quantityP_val;
					nlapiSetCurrentLineItemValue('item', totalP, totalP_val,
							true);
				}
			}

			if (name == quantityP) {
				var costP_val = common
						.convertValToNum(nlapiGetCurrentLineItemValue('item',
								costP));
				var quantityP_val = common
						.convertValToNum(nlapiGetCurrentLineItemValue('item',
								quantityP));
				var totalP_val = 0;
				if (costP_val >= 0 && quantityP_val >= 0) {
					totalP_val = costP_val * quantityP_val;
					nlapiSetCurrentLineItemValue('item', totalP, totalP_val,
							true);
				}
			}

		}
	} catch (ex) {
		nlapiLogExecution('debug', 'clientFieldChanged', ex);
		common.sendErrorEmail('mark.han@triggerasia.com', 'Riviera',
				'TN_CS_Budget', 'clientFieldChanged', ex);
	}
}

function clientPostSourcing(type, name) {
	try {
		var totalP = 'custcol_tn_total_p';
		var totalS = 'amount';
		var costP = 'custcol_tn_cost_p';
		var quantityP = 'custcol_tn_quantity_p';
		if ((type == 'item') && (name == 'item')) {
			if (nlapiGetCurrentLineItemValue('item', 'item') == '-2') {// revise
				// subtotal
				// calculation
				// logic
				nlapiSetCurrentLineItemValue('item', quantityP, '', false,
						false);
				/*
				 * var index = nlapiGetCurrentLineItemIndex('item'); var s = 0;
				 * for (var i = 1; i < index; i++) { if
				 * (nlapiGetLineItemValue('item', 'item', i) != '-2') { s +=
				 * common.convertValToNum(nlapiGetLineItemValue('item', totalP,
				 * i)); } } nlapiSetCurrentLineItemValue('item', totalP, s,
				 * false, false);
				 */

			} else {
				var totalP_val = common
						.convertValToNum(nlapiGetCurrentLineItemValue('item',
								totalP));
				var totalS_val = common
						.convertValToNum(nlapiGetCurrentLineItemValue('item',
								totalS));
				var percentage_val = '';
				if (totalP_val > 0 && totalS_val > 0) {
					percentage_val = common.convertNumToTaxRate(totalS_val
							/ totalP_val - 1);
					nlapiSetCurrentLineItemValue('item',
							'custcol_tn_percentage', percentage_val, false);
				}

				var costP_val = common
						.convertValToNum(nlapiGetCurrentLineItemValue('item',
								costP));
				var quantityP_val = common
						.convertValToNum(nlapiGetCurrentLineItemValue('item',
								quantityP));
				var totalP_val = 0;
				if (costP_val > 0 && quantityP_val > 0) {
					totalP_val = costP_val * quantityP_val;
					nlapiSetCurrentLineItemValue('item', totalP, totalP_val,
							false);
				}
			}
		}
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'clientPostSourcing', ex);
		common.sendErrorEmail('mark.han@triggerasia.com', 'Riviera',
				'TN_CS_Budget', 'clientPostSourcing', ex);
	}
}

function clientRecalc(type) {
	try {
		var totalP = 'custcol_tn_total_p';
		var totalS = 'amount';
		var costP = 'custcol_tn_cost_p';
		var quantityP = 'custcol_tn_quantity_p';
		if (!nlapiGetCurrentLineItemValue('item', 'item')) {
			var c = nlapiGetLineItemCount('item');
			var index = nlapiGetCurrentLineItemIndex('item');
			if (index > c) {
				for (var i = 1; i <= c; i++) {
					var totalP_val = common
							.convertValToNum(nlapiGetLineItemValue('item',
									totalP, i));
					var costP_val = common
							.convertValToNum(nlapiGetLineItemValue('item',
									costP, i));
					var quantityP_val = common
							.convertValToNum(nlapiGetLineItemValue('item',
									quantityP, i));
					if (!totalP_val && costP_val && quantityP_val) {
						if (costP_val > 0 && quantityP_val > 0) {
							nlapiCancelLineItem('item');
							nlapiSelectLineItem('item', i);
							totalP_val = costP_val * quantityP_val;
							nlapiSetCurrentLineItemValue('item', totalP,
									totalP_val, true, true);
							nlapiCommitLineItem('item');
						}
					}
				}
			}
		}

		reCalcSubtotalP();// update subtotal totalP
		autoCalculateMargin();// set margin
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'clientRecalc', ex);
		common.sendErrorEmail('charles.zhangn@triggerasia.com', 'Riviera',
				'TN_CS_Budget', 'clientRecalc', ex);
	}
}

function clientValidateLine(type) {
	try {
		if (type == 'item') {
			if (nlapiGetCurrentLineItemValue('item', 'item') == '22') {
				var index = nlapiGetCurrentLineItemIndex('item');
				var margin = common
						.convertValToNum(nlapiGetFieldValue('subtotal'));
				var c = nlapiGetLineItemCount('item');
				if (index > c) {
					margin += common
							.convertValToNum(nlapiGetCurrentLineItemValue(
									'item', 'amount'));
				}
				var totalP = 0;
				for (var i = 1; i <= c; i++) {
					if (nlapiGetLineItemValue('item', 'item', i) != '-2') {
						totalP += common.convertValToNum(nlapiGetLineItemValue(
								'item', 'custcol_tn_total_p', i));
					}
				}
				margin = margin - totalP;
				nlapiSetFieldValue('custbody_tn_margin', margin);
				var grossTotal = common
						.convertValToNum(nlapiGetFieldValue('total'));
				if (index > c) {
					grossTotal += common
							.convertValToNum(nlapiGetCurrentLineItemValue(
									'item', 'grossamt'));
				}
				var marginPercentage = grossTotal == 0 ? 0 : margin
						/ grossTotal;

				nlapiSetFieldValue('custbody_tn_margin_percentage', common
						.convertNumToTaxRate(marginPercentage, 2));
			}

		}
		var index = common.convertValToNum(
				nlapiGetCurrentLineItemIndex('item'), 0);
		var count = nlapiGetLineItemCount('item');
		if (index > count) {
			var quantityP = nlapiGetCurrentLineItemValue('item',
					'custcol_tn_quantity_p');
			var quantityS = nlapiGetCurrentLineItemValue('item', 'quantity');
			if (quantityP != quantityS) {
				nlapiSetCurrentLineItemValue('item', 'quantity', quantityP);
			}
		}

		return true;
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'clientValidateLine', ex);
		common.sendErrorEmail('mark.han@triggerasia.com', 'Riviera',
				'TN_CS_Budget', 'clientValidateLine', ex);
	}

}

function clientValidateField(type, name, linenum) {
	try {
		if (name == 'discountrate') {
			var sysDiscount = nlapiGetFieldValue('discountrate');
			var reNum = /^-?\d+(\.\d+)?$/.test(sysDiscount);
			if (!reNum) {
				alert('Please enter a number type');
			}
		}
		return true;
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'clientValidateField', ex);
		common.sendErrorEmail('mark.han@triggerasia.com', 'Riviera',
				'TN_CS_Budget', 'clientValidateField', ex);
	}
}

// new functions added by trigger charles
function autoCalculateMargin() {// auto calculate margin and Margin Percentage
	setTimeout(
			function() {
				try {
					var availItems = {
						ids : [],// used for search
						details : {}
					};

					var lineCount = nlapiGetLineItemCount('item');
					for (var l = 1; l <= lineCount; l++) {
						var itemId = nlapiGetLineItemValue('item', 'item', l);
						var curDetail = {
							linenum : l,
							totals : common
									.convertValToNum(nlapiGetLineItemValue(
											'item', 'amount', l)),
							totalp : common
									.convertValToNum(nlapiGetLineItemValue(
											'item', 'custcol_tn_total_p', l)),
							grossAmt : common
									.convertValToNum(nlapiGetLineItemValue(
											'item', 'grossamt', l))
						};

						if (availItems.ids.indexOf(itemId) == -1) {
							availItems.ids.push(itemId);
						}

						if (availItems['details'][itemId]) {
							availItems['details'][itemId].push(curDetail);
						} else {
							availItems['details'][itemId] = [ curDetail ];
						}
					}

					if (availItems.ids.length) {
						var filters = [
								new nlobjSearchFilter('internalid', null,
										'anyof', availItems.ids),
								new nlobjSearchFilter('type', null, 'anyof', [
										'NonInvtPart', 'Markup' ]) ];
						var results = nlapiSearchRecord('item', null, filters);

						// console.log('results is ', results);//test

						if (results) {
							var totalAll = {
								totals : 0,
								totalp : 0,
								grossAmt : 0
							};

							results
									.forEach(function(item) {
										availItems['details'][item.getId()]
												.forEach(function(detail) {
													totalAll.totals += detail['totals'];
													totalAll.totalp += detail['totalp'];
													totalAll.grossAmt += detail['grossAmt'];
												});
									});

							// console.log('totalAll is ', totalAll);//test

							var margin = totalAll.totals - totalAll.totalp;
							var marginPercentage = common
									.convertNumToTaxRate(margin
											/ totalAll.grossAmt);
							nlapiSetFieldValue('custbody_tn_margin', margin
									.toFixed(2));
							nlapiSetFieldValue('custbody_tn_margin_percentage',
									marginPercentage);
						}
					}
				} catch (e) {
					nlapiLogExecution('DEBUG', 'set margin error', e.toString());
				}
			}, 100);
}

function reCalcSubtotalP() {
	try {
		// console.log('the first subtotal is in line ',
		// nlapiFindLineItemValue('item', 'item', '-2'));
		if (nlapiFindLineItemValue('item', 'item', '-2') == -1)
			return false;// no subtotal item, end up function

		var lineCount = nlapiGetLineItemCount('item');
		var subtotalRange = [];
		var availItems = {
			ids : [],// used for search
			details : [ null ]
		};

		for (var l = 1; l <= lineCount; l++) {
			var itemId = nlapiGetLineItemValue('item', 'item', l);

			availItems['details'].push({
				linenum : l,
				lineid : itemId,
				totalp : common.convertValToNum(nlapiGetLineItemValue('item',
						'custcol_tn_total_p', l)),
				type : itemId == '-2' ? 'subtotalitem' : null
			});

			if (itemId == '-2' && l > 1)
				subtotalRange.push(l);// 鍒楀嚭鎵�鏈塻ubtotal鍖洪棿,蹇界暐棣栬

			if (availItems.ids.indexOf(itemId) == -1 && itemId != '0') {
				availItems.ids.push(itemId);
			}
		}

		// console.log('subtotalRange is ',
		// subtotalRange);console.log(availItems);

		if (availItems.ids.length) {
			var filters = [
					new nlobjSearchFilter('internalid', null, 'anyof',
							availItems.ids),
					new nlobjSearchFilter('type', null, 'anyof',
							[ 'NonInvtPart' ]) ];
			var results = nlapiSearchRecord('item', null, filters);

			if (results) {
				var typeCache = {}, resultsLen = results.length;

				subtotalRange.forEach(function(subLineNum) {
					var subtotalP = 0;

					for (var i = subLineNum - 1; i >= 1; i--) {
						var line = availItems['details'][i];
						var lineid = line.lineid;

						// get line type
						if (typeCache[lineid]) {
							line.type = typeCache[lineid];
						} else {
							for (var j = 0; j < resultsLen; j++) {
								if (lineid == results[j].getId()) {
									typeCache[lineid] = line.type = results[j]
											.getRecordType();
									break;
								}
							}
						}

						if (line.type === 'noninventoryitem') {
							subtotalP += line.totalp;
						} else if (line.type === 'subtotalitem') {
							break;
						}
					}

					var oldSubtotalP = common
							.convertValToNum(nlapiGetLineItemValue('item',
									'custcol_tn_total_p', subLineNum));
					if (oldSubtotalP != subtotalP) {
						nlapiSetLineItemValue('item', 'custcol_tn_total_p',
								subLineNum, subtotalP);
					}
				});

			}
		}

	} catch (e) {
		if (typeof console != 'undefined')
			console.log('updating subtotalp error', e);
	}
}