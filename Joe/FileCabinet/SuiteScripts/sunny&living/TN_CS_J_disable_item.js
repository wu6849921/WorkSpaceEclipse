/**
 * Module Description
 * 
 * Version Date Author Remarks Joe 10180108
 */

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

// entry point
function pageInit()
{
   //On init, disable two optional Other fields: fieldA and fieldB.
	nlapiDisableLineItemField('itemvendor', 'vendor', true);
	nlapiDisableLineItemField('itemvendor', 'vendorcode', true);
	nlapiDisableLineItemField('itemvendor', 'schedule', true);
	nlapiDisableLineItemField('itemvendor', 'preferredvendor', true);
	nlapiDisableLineItemField('itemvendor', 'purchaseprice', true);
//	$('itemvendorprice_helper_popup').attr("disabled",true)//将input元素设置为disabled
	var a = document.getElementById('itemvendorprice_helper_popup');
	a.onclick=function(e){
		return false;
	}
//	
//	var a = document.getElementById('price3txt');
//	a.onclick=function(e){
		document.getElementById('price_1_1_formattedValue').disabled=true;
		document.getElementById('price_2_1_formattedValue').disabled=true;
		document.getElementById('price_3_1_formattedValue').disabled=true;
		document.getElementById('price_4_1_formattedValue').disabled=true;
		document.getElementById('price_5_1_formattedValue').disabled=true;
//		return true;
//	}
	
//	var a= nlapiGetLineItemMatrixField('price1', 'price',1,1);
//	a.setDisplayType('disabled');
//	alert(nlapiGetMatrixCount('price1', 'currency'));
//	alert(nlapiGetMatrixCount('price1', 'discount'));
//	alert(nlapiGetMatrixCount('price1', 'discountdisplay'));
//	nlapiDisableLineItemField('price1', 'discount', true);
//	nlapiDisableLineItemField('price1', 'discountdisplay', true);
//	alert(a);
}