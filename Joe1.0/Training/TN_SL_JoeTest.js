function demoSimpleForm(request, response) {
	if (request.getMethod() == 'GET') {
		var subject = request.getParameter('custparam_tn_note');
		var emId = request.getParameter('custparam_tn_emid');
		var form = nlapiCreateForm('Simple Form', false);
		form.addFieldGroup('custpage_tn_fieldgroup', 'Joe Group');
		var field = form.addField('custpage_tn_subject', 'text', 'Subject',
				null, 'custpage_tn_fieldgroup');
		field.setDefaultValue(subject);

		var fieldEmId = form.addField('custpage_tn_empid', 'text');
		fieldEmId.setDisplayType('hidden');
		fieldEmId.setDefaultValue(emId);
		form.addSubmitButton('Submit');

		form.setScript('customscript_tn_testrec');

		response.writePage(form);
	} else {
		var subject = request.getParameter('custpage_tn_subject');
		var emId = request.getParameter('custpage_tn_empid');
		var empRec = nlapiLoadRecord('employee', emId);
		empRec.setFieldValue('comments', subject);
		nlapiSubmitRecord(empRec);
		nlapiSetRedirectURL('RECORD', 'employee', emId, false);
	}
}