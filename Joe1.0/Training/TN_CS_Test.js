//±íµ¥¼¶CS
function pageInitForm(type) {
	// function pageInit(type) {
	// Display information
	// nlapiSetFieldValue('custentity_tn_emp_joetest', 'abc');
	// nlapiDisableField('custentity_tn_emp_joetest', true);
	// var joeTest = nlapiGetFieldValue('custentity_tn_emp_joetest');
	// alert('this is form level');
	// alert('ok2');
	// consle.log();
}

function fieldChanged(type, name, linenum) {
	// Prompt for additional information, based on values already selected.
	if (name === 'title') {
		nlapiSetFieldValue('custentity_tn_emp_joetest',
				nlapiGetFieldValue('title'));
	}
	if (type == 'accruedtime' && name == 'accrualrate') {
		// ....
	}
}

function validateField(type, name) {
	// if fieldA is not at least 6 characters, fail validation
	if (name === 'custentity_tn_emp_joetest') {
		var fieldALength = String(nlapiGetFieldValue('custentity_tn_emp_joetest')).length;

		if (fieldALength < 6) {
			// alert("FieldA must be at least 6 characters.");
			return false;
		}
	}
	// Always return true at this level, to continue validating other fields
	return true;
}

function saveRecord() {
	// Check to see that fieldA is populated. If not, block the save and warn
	// with a popup.

	if (String(nlapiGetFieldValue('custentity_tn_emp_joetest')).length === 0) {
		alert("Please provide a value for fieldA");
		return false;
	}
	alert("Are you sure you want to Save the record?");
	return true;
}