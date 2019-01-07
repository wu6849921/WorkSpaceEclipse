/**
 * Module Description
 * 
 * Version Date Author Remarks Joe 10180108
 */

// entry point
function pageInit(type) {
	try {
		nlapiDisableLineItemField('item', 'rate', true);
		// return true;
	} catch (ex) {
		alert(ex);
	}
}
