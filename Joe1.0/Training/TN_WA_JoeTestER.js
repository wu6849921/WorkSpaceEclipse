function setEmployeeNotes(id, type, form) {
	var context = nlapiGetContext();
	var param = context.getSetting('SCRIPT', 'custscript4');
	var newRecordNew = nlapiGetNewRecord();
	var emloyeeId = newRecordNew.getFieldValue('entity');
	var employeeRec = nlapiLoadRecord('employee', emloyeeId);
	employeeRec.setFieldValue('comments', param);
	nlapiSubmitRecord(employeeRec);

	// savedsearch

	return param;
}
