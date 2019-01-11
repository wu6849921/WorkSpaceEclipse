function updateDepartment(rec_type, rec_id) {
	var transaction = nlapiLoadRecord(rec_type, rec_id);
//	transaction.setFieldValue('department', nlapiGetContext().getSetting(
//			'SCRIPT', 'custscriptcustscript_dept_update'));
	nlapiSubmitRecord(transaction, false, true);

	// search
	job == job
	fiappver = yes

}