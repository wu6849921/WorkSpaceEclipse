/*******************************************************************************
 * 
 * The following javascript code is created by FMT Consultants LLC, a NetSuite
 * Partner. It is a SuiteFlex component containing custom code intended for
 * NetSuite (www.netsuite.com) and use the SuiteScript API. The code is provided
 * "as is": FMT Consultants LLC shall not be liable for any damages arising out
 * the intended use or if the code is modified after delivery.
 * 
 * Company: FMT Consultants LLC, www.fmtconsultants.com Author:
 * smehmood@fmtconsultants.com File: Jp_HoldBilling_Cl.js Date: 11/30/2017
 * 
 ******************************************************************************/
var JpHoldBillingCL = (function() {
	return {
		save : function() {
			var result = true;
			var index;
			var totalLinesCount = 0;
			var holdLinesCount = 0;

			totalLinesCount = nlapiGetLineItemCount('item');
			for (var i = 1; i <= totalLinesCount; i++) {
				if (nlapiGetLineItemValue('item', 'custcol_holdbilling', i) === "T")
					holdLinesCount++;
			}

			if (holdLinesCount === totalLinesCount) {
				alert("Invoice cannot be saved, Billing is on hold for all lines");
				result = false;
			}
			return result;
		},
		pageInit : function(type) {
			jQuery(document).ready(
					function() {
						try {
							debugger;
							if (type == 'copy') {

								var nextIndex = 1;
								while (nextIndex != -1) {
									nextIndex = nlapiFindLineItemValue('item',
											'custcol_holdbilling', 'T');
									if (nextIndex > 0)
										nlapiRemoveLineItem('item', nextIndex);
								}
							}
						} catch (ex) {

						}
					});
		}
	};
})();

// Save
function JpHoldBillingCL_Save() {
	return JpHoldBillingCL.save();
}

// Page Init
function JpHoldBillingCL_PageInit(type) {
	return JpHoldBillingCL.pageInit(type);
}
