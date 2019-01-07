/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 02 Dec 2016 Han Dong
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
 *            type Sublist internal id
 * @param {String}
 *            name Field internal id
 * @param {Number}
 *            linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function clientFieldChanged(type, name, linenum) {
	try {
		var commRate = 'custrecord_tn_rate';
		var commGrossMargin = 'custrecord_tn_gross_margin';

		if (name == commRate) {
			commAmountFN();
		}

		if (name == commGrossMargin) {
			commAmountFN();
		}

	} catch (ex) {
		nlapiLogExecution('DEBUG', 'clientFieldChanged', ex);
		common.sendErrorEmail('mark.han@triggerasia.com', 'Riviera',
				'TN_CS_Commission', 'clientFieldChanged', ex);
	}
}

function commAmountFN() {
	try {
		var commRate = 'custrecord_tn_rate';
		var commGrossMargin = 'custrecord_tn_gross_margin';
		var commAmount = 'custrecord_tn_commission_amount';
		var commRate_val = 0;
		var commGrossMargin_val = 0;
		var commAmount_val = 0;
		commRate_val = common.convertTaxrateToNum(nlapiGetFieldValue(commRate));
		commGrossMargin_val = common
				.convertValToNum(nlapiGetFieldValue(commGrossMargin));
		if (commRate_val && commGrossMargin_val) {
			commAmount_val = parseInt(commRate_val * commGrossMargin_val);
			nlapiSetFieldValue(commAmount, commAmount_val);
		}
	} catch (ex) {
		nlapiLogExecution('DEBUG', 'commAmountFN Client Script', ex);
		return common.getReturnError('TN_CS_Commission commAmountFN Error: '
				+ ex);
	}
}