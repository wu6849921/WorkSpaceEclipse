/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define([ 'N/record' ], function(record) {
	/**
	 * Function to be executed after page is initialized.
	 * 
	 * @param {Object}
	 *            scriptContext
	 * @param {Record}
	 *            scriptContext.currentRecord - Current form record
	 * @param {string}
	 *            scriptContext.mode - The mode in which the record is being
	 *            accessed (create, copy, or edit)
	 * 
	 * @since 2015.2
	 */
	function afterSubmit(context) {
		var newRecord = context.newRecord;
		// alert(fieldName);
		if (newRecord.type === 'customer') {
			var cVendor = newRecord.getValue({
				fieldId : 'custentity_tn_customer_vendor'
			});
			if (cVendor) {
				var venRecord = record.load({
					type : record.Type.VENDOR,
					id : cVendor
				});
				var cutId = venRecord.getValue({
					fieldId : 'custentity_tn_vendor_customer'
				});
				if (cutId == newRecord.id) {
					return;
				}
				venRecord.setValue({
					fieldId : 'custentity_tn_vendor_customer',
					value : newRecord.id
				});
				venRecord.save();
				// var id = record.submitFields({
				// type : record.Type.VENDOR,
				// id : cVendor,
				// values : {
				// custentity_tn_vendor_customer : newRecord.id
				// }
				// });
			}

		}
		if (newRecord.type === 'vendor') {
			var vCustomer = newRecord.getValue({
				fieldId : 'custentity_tn_vendor_customer'
			});
			if (vCustomer) {
				var cusRecord = record.load({
					type : record.Type.CUSTOMER,
					id : vCustomer
				});
				var venId = venRecord.getValue({
					fieldId : 'custentity_tn_customer_vendor'
				});
				if (venId == newRecord.id) {
					return;
				}
				cusRecord.setValue({
					fieldId : 'custentity_tn_customer_vendor',
					value : newRecord.id
				});
				venRecord.save();
				// var id = record.submitFields({
				// type : record.Type.CUSTOMER,
				// id : vCustomer,
				// values : {
				// custentity_tn_customer_vendor : newRecord.id
				// }
				// });
			}

		}

	}

	return {
		afterSubmit : afterSubmit
	};
});