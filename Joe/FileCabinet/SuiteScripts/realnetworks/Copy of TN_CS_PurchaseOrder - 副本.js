/*******************************************************************************
 * File Name : TN_CS_PurchaseOrder.js Description : Client script on purchase
 * order Company : Trigger Networks Created By : Daniel Cai Created On :
 * 5/16/2014
 ******************************************************************************/

var productAndDescription = '';
var clickDone = true;

function poPageInit(type) {
	try {
		// alert('type: ' + type);
		nlapiSetFieldValue('custbody_tn_complete', 'T');
	} catch (ex) {
		alert('Error');
		alert(ex);
		alert(ex.getDetails());
	}
}

function poSaveRecord() {
	try {
		var isChecked = nlapiGetFieldValue('custbody_tn_prchecked');
		var vendorId = nlapiGetFieldValue('entity');
		if (isChecked == 'T' && vendorId == '858') {
			alert('Please select a normal vendor before you submit the PO');
			return false;
		}
		if (!clickDone) {
			alert('Please click \'OK\' or \'ADD\' after you finish line editing.');
			return false;
		}

		if (isNull(nlapiGetFieldValue('custbody_tn_vendorcontractexpire')))
			nlapiSetFieldValue('custbody_tn_contractexperid', 'T');
		var poId = nlapiGetRecordId();
		poId == isNull(poId) ? 0 : poId;
		var currency = nlapiGetFieldText('currency');
		var totalAmt = nlapiGetFieldValue('total');
		// if ((currency.indexOf('RMB') != -1 && totalAmt > 30000)
		// || (currency.indexOf('USD') != -1 && totalAmt > 5000)) {
		// var statusId = nlapiGetFieldValue('custbody_tn_prstatus');
		// var statusText = nlapiGetFieldText('custbody_tn_prstatus');
		// // alert(statusId + ' statusText: ' + statusText);
		// if (statusId == 9) { // Open
		// var isSubmit = nlapiGetFieldValue('custbody_tn_complete');
		// // alert('isSubmit: ' + isSubmit);
		// if (isSubmit == 'T') {
		// alert('The total amount is over 5KU, please fill out the additional
		// information. Thank you!');
		// nlapiSetFieldValue('custbody_tn_complete', 'F');
		// nlapiSetFieldValue('custbody_tn_popup5kform', 'T');
		// } else
		// alert('Your purchase request is NOT submitted. Current information
		// will be saved as a draft.');
		// return true;
		// } else {
		// var filters = new Array();
		// filters.push(new nlobjSearchFilter('custrecord_tn_prid', null,
		// 'is', poId));
		// // filters.push(new
		// // nlobjSearchFilter('custrecord_tn_formcompleted', null, 'is',
		// // 'T'));
		// var columns = new Array();
		// columns.push(new nlobjSearchColumn(
		// 'custrecord_tn_formcompleted'));
		// var cfoForm = nlapiSearchRecord('customrecord_tn_cfoform',
		// null, filters, columns);
		// if (isNull(cfoForm)) {
		// // alert('Please complete the International Requisition
		// // Form');
		// nlapiSetFieldValue('custbody_tn_prchecked', 'F');
		// if (confirm('Please fill in the International Requisition form')) {
		// var preHref = window.location.href.substring(0,
		// window.location.href.indexOf('.com/') + 5);
		// var myurl = preHref
		// +
		// 'app/common/custom/custrecordentry.nl?rectype=24&pf=CUSTRECORD_TN_PRID&pi='
		// + nlapiGetRecordId() + '&pr=-30';
		// window.open(myurl, "_blank");
		// return true;
		// } else
		// return false;
		// } else {
		// var isCompleted = cfoForm[0]
		// .getValue('custrecord_tn_formcompleted');
		// if (isCompleted == 'T')
		// return true;
		// else {
		// nlapiSetFieldValue('custbody_tn_prchecked', 'F');
		// if (confirm('Please complete the International Requisition form')) {
		// var myurl = nlapiResolveURL('RECORD',
		// 'customrecord_tn_cfoform', cfoForm[0]
		// .getId());
		// window.open(myurl, "_blank");
		// return true;
		// } else
		// return false;
		// }
		// }
		// }
		// } else {
		// var isSubmit = nlapiGetFieldValue('custbody_tn_complete');
		// if (isSubmit != 'T')
		// alert('Your purchase request is NOT submitted. Current information
		// will be saved as a draft.');
		// }

		var sumQty = 0;
		for (var i = 1; i <= nlapiGetLineItemCount('item'); i++) {
			nlapiSelectLineItem('item', i);
			var taxCode = nlapiGetCurrentLineItemText('item', 'taxcode');
			var unitPriceTax = nlapiGetCurrentLineItemValue('item',
					'custcol_tn_unitpriceincltax');
			var lineQty = nlapiGetCurrentLineItemValue('item', 'quantity');
			sumQty = parseFloat(sumQty) + parseFloat(lineQty);
			// alert('unitPriceTax: ' + unitPriceTax);
			var taxRate = taxCode.substring(taxCode.indexOf(':') + 1, taxCode
					.indexOf('%'));
			taxRate = ((0 < taxRate && taxRate < 100) ? taxRate : 0) / 100;
			// alert('taxRate: ' + taxRate);
			var unitPriceNoTax = parseFloat(unitPriceTax / (1 + taxRate))
					.toFixed(4);
			nlapiSetCurrentLineItemValue('item', 'rate', unitPriceNoTax);
			nlapiCommitLineItem('item');
		}
		// alert('sumQty: ' + sumQty);
		nlapiSetFieldValue('custbody_tn_sumquantity', sumQty);
		return true;
	} catch (ex) {
		alert('Error');
		alert(ex);
		alert(ex.getDetails());
	}
}

function poFieldValidation(type, name, linenum) {
	try {
		return true;
	} catch (ex) {
		alert('Error');
		alert(ex);
		alert(ex.getDetails());
	}
}

function poFieldChange(type, name, linenum) {
	try {
		if (name == 'custcol_tn_unitpriceincltax') {
			var taxCode = nlapiGetCurrentLineItemText('item', 'taxcode');
			var unitPriceTax = nlapiGetCurrentLineItemValue('item',
					'custcol_tn_unitpriceincltax');
			// alert('unitPriceTax: ' + unitPriceTax);
			var taxRate = taxCode.substring(taxCode.indexOf(':') + 1, taxCode
					.indexOf('%'));
			taxRate = ((0 < taxRate && taxRate < 100) ? taxRate : 0) / 100;
			// alert('taxRate: ' + taxRate);
			var unitPriceNoTax = parseFloat(unitPriceTax / (1 + taxRate))
					.toFixed(4);
			nlapiSetCurrentLineItemValue('item', 'rate', unitPriceNoTax);
		}

		if (name == 'taxcode') {
			var taxCode = nlapiGetCurrentLineItemText('item', 'taxcode');
			var unitPriceTax = nlapiGetCurrentLineItemValue('item',
					'custcol_tn_unitpriceincltax');
			// alert('unitPriceTax: ' + unitPriceTax);
			var taxRate = taxCode.substring(taxCode.indexOf(':') + 1, taxCode
					.indexOf('%'));
			taxRate = ((0 < taxRate && taxRate < 100) ? taxRate : 0) / 100;
			// alert('taxRate: ' + taxRate);
			var unitPriceNoTax = parseFloat(unitPriceTax / (1 + taxRate))
					.toFixed(4);
			nlapiSetCurrentLineItemValue('item', 'rate', unitPriceNoTax);
		}

		return true;
	} catch (ex) {
		alert('Error');
		alert(ex);
		alert(ex.getDetails());
	}
}

function lineInit(type) {
	try {
		if (type == 'item') {
			nlapiDisableLineItemField('item', 'rate', true);
			nlapiDisableLineItemField('item', 'amount', true);
			productAndDescription = nlapiGetCurrentLineItemValue('item',
					'description');
		}
	} catch (ex) {
		alert('Error');
		alert(ex);
		alert(ex.getDetails());
	}
}

function poPostSourcing(type, name, linenum) {
	try {
		if (name == 'item') {
			// alert('poPostSourcing: ' + productAndDescription);
			nlapiSetCurrentLineItemValue('item', 'description',
					productAndDescription);
			// alert('poPostSourcing: item updated');
		}
	} catch (ex) {
		alert('Error');
		alert(ex);
		alert(ex.getDetails());
	}
}

function validateLine(type) {
	try {
		if (type == 'item') {
			var taxCode = nlapiGetCurrentLineItemText('item', 'taxcode');
			var unitPriceTax = nlapiGetCurrentLineItemValue('item',
					'custcol_tn_unitpriceincltax');
			// alert('unitPriceTax: ' + unitPriceTax);
			var taxRate = taxCode.substring(taxCode.indexOf(':') + 1, taxCode
					.indexOf('%'));
			taxRate = ((0 < taxRate && taxRate < 100) ? taxRate : 0) / 100;
			// alert('taxRate: ' + taxRate);
			var unitPriceNoTax = parseFloat(unitPriceTax / (1 + taxRate))
					.toFixed(4);
			nlapiSetCurrentLineItemValue('item', 'rate', unitPriceNoTax);
			clickDone = false;
			// alert('validateLine ' + clickDone);
		}
		return true;
	} catch (ex) {
		alert('Error');
		alert(ex);
		alert(ex.getDetails());
	}
}

function poRecalc(type, name, linenum) {
	clickDone = true;
	// alert('poRecalc ' + clickDone);
}

function isNull(str) {
	if (str == null || str == '')
		return true;
	else
		false;
}

function GetUrlParms() {
	var args = new Object();
	var query = document.location.search.substring(1);
	var pairs = query.split("&");
	for (var i = 0; i < pairs.length; i++) {
		var pos = pairs[i].indexOf('=');
		if (pos == -1)
			continue;
		var argname = pairs[i].substring(0, pos);
		var value = pairs[i].substring(pos + 1);
		args[argname] = unescape(value);
	}
	return args;
}