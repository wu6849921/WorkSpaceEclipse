function demoSimpleForm(request, response) {
	var subject = request.getParameter('custparam_tn_note');
	var subject = request.getParameter('custparam_tn_note');
	var subject = request.getParameter('custparam_tn_note');
	var subject = request.getParameter('custparam_tn_note');
	var user = request.getParameter('custparam_tn_user');
	var psw = request.getParameter('custparam_tn_psw');
	// nlapiLogExecution('DEBUG', 'subject', subject);
	// ´´½¨SO
	if (subject == '1') {
		response.write('true');
	} else {
		response.write('false');
	}
}