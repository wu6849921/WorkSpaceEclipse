/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope Public Extract common parts for cs/ue cashflow validation logic
 */
define([ '../../lib/wrapper/ns_wrapper_runtime',
		'../../lib/wrapper/ns_wrapper_url',
		'../../lib/wrapper/ns_wrapper_https', '../../lib/commons',
		'../../lib/wrapper/ns_wrapper_search',
		'../../lib/wrapper/ns_wrapper_error' ], function(runtime, url, https,
		commons, search, error) {
	function toValidateTransactionLines(currentRec, journalWhiteList) {
		var subsidiaryId = currentRec.getValue({
			fieldId : 'subsidiary'
		});

		var slUrl = url.resolveScript({
			scriptId : 'customscript_sl_cn_cashflow_validation',
			deploymentId : 'customdeploy_sl_cn_cashflow_validation',
			params : {
				subsidiaryId : subsidiaryId
			}
		});

		try {
			var response = https.get({
				url : slUrl
			});
			log.debug("cs_cn_cashflow_ap_ar_validation response from sl",
					response.body);
		} catch (ex) {
			throw error.create({
				name : error.UserError,
				message : ex.message
			});
		}
		if (response.body === 'true'
				|| journalWhiteList.indexOf(currentRec.type) > 0) {
			return true;
		} else {
			return false;
		}

	}

	function isSubsidiaryRequireCfi(currentRec) {
		var subsidiaryId = currentRec.getValue({
			fieldId : 'subsidiary'
		});
		var subsidiaryLookup = search.lookupFields({
			type : search.Type.SUBSIDIARY,
			id : subsidiaryId,
			columns : [ 'custrecord_cn_cfi_mandatory' ]
		});
		var needValidate = commons
				.makesure(subsidiaryLookup.custrecord_cn_cfi_mandatory)
				&& subsidiaryLookup.custrecord_cn_cfi_mandatory;
		return needValidate;
	}

	function hasHeaderCfsItem(currentRec) {
		var headerCfs = null;
		if (commons.makesure(currentRec)) {
			headerCfs = currentRec.getValue({
				fieldId : 'custbody_cseg_cn_cfi'
			});
		}
		return commons.makesure(headerCfs) ? true : false;
	}

	return {
		toValidateTransactionLines : toValidateTransactionLines,
		isSubsidiaryRequireCfi : isSubsidiaryRequireCfi,
		hasHeaderCfsItem : hasHeaderCfsItem
	}

});
