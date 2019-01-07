/*******************************************************************************
 * File Name : TN_UE_PO.js Description : User event on purcahse order Company :
 * Trigger Networks Created By : Daniel Created On : 27/06/2014
 ******************************************************************************/

function beforeLoad(type, form, request) {
	try {
		// form.setScript('customscript_tn_ueonpo');
		// if (nlapiGetRecordType() == 'purchaseorder')
		// var qcBtn = form.addButton('custpage_startqc', 'Start QC',
		// 'startQC()');
		// var fld = nlapiGetLineItemField('item', 'vendorname', 1);
		// fld.setDisplayType('hidden');
		// //var fld = nlapiGetLineItemField('item', 'options', 1);
		// //fld.setDisplayType('hidden');
		// var fld = nlapiGetLineItemField('item', 'currency', 1);
		// if (!isNull(fld)) fld.setDisplayType('hidden');
		var USD1 = nlapiGetLineItemMatrixField('price1', 'price', 1, 1);
		var USD2 = nlapiGetLineItemMatrixField('price1', 'price', 1, 2);
		var USD3 = nlapiGetLineItemMatrixField('price1', 'price', 1, 3);
		var USD4 = nlapiGetLineItemMatrixField('price1', 'price', 1, 4);
		var USD5 = nlapiGetLineItemMatrixField('price1', 'price', 1, 5);
		USD1.setDisplayType('disabled');
		USD2.setDisplayType('disabled');
		USD3.setDisplayType('disabled');
		USD4.setDisplayType('disabled');
		USD5.setDisplayType('disabled');

		var GBR1 = nlapiGetLineItemMatrixField('price2', 'price', 1, 1);
		var GBR2 = nlapiGetLineItemMatrixField('price2', 'price', 1, 2);
		var GBR3 = nlapiGetLineItemMatrixField('price2', 'price', 1, 3);
		var GBR4 = nlapiGetLineItemMatrixField('price2', 'price', 1, 4);
		var GBR5 = nlapiGetLineItemMatrixField('price2', 'price', 1, 5);
		GBR1.setDisplayType('disabled');
		GBR2.setDisplayType('disabled');
		GBR3.setDisplayType('disabled');
		GBR4.setDisplayType('disabled');
		GBR5.setDisplayType('disabled');

		var CD1 = nlapiGetLineItemMatrixField('price3', 'price', 1, 1);
		var CD2 = nlapiGetLineItemMatrixField('price3', 'price', 1, 2);
		var CD3 = nlapiGetLineItemMatrixField('price3', 'price', 1, 3);
		var CD4 = nlapiGetLineItemMatrixField('price3', 'price', 1, 4);
		var CD5 = nlapiGetLineItemMatrixField('price3', 'price', 1, 5);
		CD1.setDisplayType('disabled');
		CD2.setDisplayType('disabled');
		CD3.setDisplayType('disabled');
		CD4.setDisplayType('disabled');
		CD5.setDisplayType('disabled');

		var Euro1 = nlapiGetLineItemMatrixField('price4', 'price', 1, 1);
		var Euro2 = nlapiGetLineItemMatrixField('price4', 'price', 1, 2);
		var Euro3 = nlapiGetLineItemMatrixField('price4', 'price', 1, 3);
		var Euro4 = nlapiGetLineItemMatrixField('price4', 'price', 1, 4);
		var Euro5 = nlapiGetLineItemMatrixField('price4', 'price', 1, 5);
		Euro1.setDisplayType('disabled');
		Euro2.setDisplayType('disabled');
		Euro3.setDisplayType('disabled');
		Euro4.setDisplayType('disabled');
		Euro5.setDisplayType('disabled');

		var RMB1 = nlapiGetLineItemMatrixField('price5', 'price', 1, 1);
		var RMB2 = nlapiGetLineItemMatrixField('price5', 'price', 1, 2);
		var RMB3 = nlapiGetLineItemMatrixField('price5', 'price', 1, 3);
		var RMB4 = nlapiGetLineItemMatrixField('price5', 'price', 1, 4);
		var RMB5 = nlapiGetLineItemMatrixField('price5', 'price', 1, 5);
		RMB1.setDisplayType('disabled');
		RMB2.setDisplayType('disabled');
		RMB3.setDisplayType('disabled');
		RMB4.setDisplayType('disabled');
		RMB5.setDisplayType('disabled');

		var HKD1 = nlapiGetLineItemMatrixField('price6', 'price', 1, 1);
		var HKD2 = nlapiGetLineItemMatrixField('price6', 'price', 1, 2);
		var HKD3 = nlapiGetLineItemMatrixField('price6', 'price', 1, 3);
		var HKD4 = nlapiGetLineItemMatrixField('price6', 'price', 1, 4);
		var HKD5 = nlapiGetLineItemMatrixField('price6', 'price', 1, 5);
		HKD1.setDisplayType('disabled');
		HKD2.setDisplayType('disabled');
		HKD3.setDisplayType('disabled');
		HKD4.setDisplayType('disabled');
		HKD5.setDisplayType('disabled');

		var JPY1 = nlapiGetLineItemMatrixField('price7', 'price', 1, 1);
		var JPY2 = nlapiGetLineItemMatrixField('price7', 'price', 1, 2);
		var JPY3 = nlapiGetLineItemMatrixField('price7', 'price', 1, 3);
		var JPY4 = nlapiGetLineItemMatrixField('price7', 'price', 1, 4);
		var JPY5 = nlapiGetLineItemMatrixField('price7', 'price', 1, 5);
		JPY1.setDisplayType('disabled');
		JPY2.setDisplayType('disabled');
		JPY3.setDisplayType('disabled');
		JPY4.setDisplayType('disabled');
		JPY5.setDisplayType('disabled');

	} catch (ex) {
		nlapiLogExecution('debug', 'poBeforeLoad', ex);
	}
}
