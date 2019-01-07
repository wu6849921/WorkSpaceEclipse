/**
 * Module Description
 * 
 * Version Date Author Remarks 1.00 28 Jun 2016 Trigger_Mark
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
 *            type Access mode: create, copy, edit
 * @returns {Void}
 * 
 * The function defines to auto fill the invoice detail, when user select the
 * customer name then the related fields in invoice detail tab will change
 * automatically
 */

function clientFieldChanged(type, name, linenum) {
	try {
		if (name == 'entity') {
			var recId = nlapiGetFieldValue('entity');

			if (!recId)
				return;
			var jobRec = nlapiLoadRecord('job', recId);
			var relatedCustomer = jobRec.getFieldValue('parent');
			nlapiSetFieldValue('custbody_tn_inv_relatedcust', relatedCustomer,
					false, true);
			var rec = nlapiLoadRecord('customer', relatedCustomer);
			var count = rec
					.getLineItemCount('recmachcustrecord_tn_cust_custnamecn'); /*
																				 * Count
																				 * is
																				 * the
																				 * numbers
																				 * of
																				 * invoice
																				 * info
																				 * in
																				 * Customer
																				 * record
																				 */
			if (count == 0) {
				alert('尚未存在开票信息记录，请先创建并设置是否为默认记录');
			} else {
				var defaultName = rec.getLineItemValue(
						'recmachcustrecord_tn_cust_custnamecn', 'id', 1);
				for (var i = 1; i <= count; i++) {
					var isDefaultInvoice = rec.getLineItemValue(
							'recmachcustrecord_tn_cust_custnamecn',
							'custrecord_tn_cust_defaultcust', i);
					if (isDefaultInvoice == 'T') {
						defaultName = rec
								.getLineItemValue(
										'recmachcustrecord_tn_cust_custnamecn',
										'id', i);
					}
				}
				nlapiSetFieldValue('custbody_tn_inv_custnamecn', defaultName);
			}
		}
	}

	catch (ex) {
		nlapiLogExecution('debug', 'clientFieldChanged', ex.details);
		common.sendErrorEmail('dev_support@triggerasia.com', 'ICD',
				'TN_CS_selectDefaultInvoice', 'clientFieldChanged', ex.details);
	}
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your
 * script deployment.
 * 
 * @appliedtorecord recordType
 * 
 * @param {String}
 *            type Access mode: create, copy, edit
 */

function clientPageInit(type) {
	try {
		if (type == 'create') {
			var recId = nlapiGetFieldValue('entity');
			if (!recId)
				return;

			var jobRec = nlapiLoadRecord('job', recId);
			var relatedCustomer = jobRec.getFieldValue('parent');
			nlapiSetFieldValue('custbody_tn_inv_relatedcust', relatedCustomer,
					false, true);

			var rec = nlapiLoadRecord('customer', relatedCustomer);
			var count = rec
					.getLineItemCount('recmachcustrecord_tn_cust_custnamecn'); /*
																				 * Count
																				 * is
																				 * the
																				 * numbers
																				 * of
																				 * invoice
																				 * info
																				 * in
																				 * Customer
																				 * record
																				 */
			if (count == 0) {
				alert('尚未存在开票信息记录，请先创建并设置是否为默认记录');
			} else {
				var defaultName = rec.getLineItemValue(
						'recmachcustrecord_tn_cust_custnamecn', 'id', 1);
				for (var i = 1; i <= count; i++) {
					var isDefaultInvoice = rec.getLineItemValue(
							'recmachcustrecord_tn_cust_custnamecn',
							'custrecord_tn_cust_defaultcust', i);
					if (isDefaultInvoice == 'T') {
						defaultName = rec
								.getLineItemValue(
										'recmachcustrecord_tn_cust_custnamecn',
										'id', i);
					}
				}
				nlapiSetFieldValue('custbody_tn_inv_custnamecn', defaultName);
			}
		}
	} catch (ex) {
		nlapiLogExecution('debug', 'clientPageInit', ex.details);
		common.sendErrorEmail('dev_support@triggerasia.com', 'ICD',
				'TN_CS_selectDefaultInvoice', 'clientPageInit', ex.details);
	}
}
