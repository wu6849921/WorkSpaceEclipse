function uploader(request, response) {
	if (request.getMethod() == 'GET') {
		var form = nlapiCreateForm('Attach File to Customer');
		var entityField = form.addField('entity', 'select', 'Customer',
				'customer');
		entityField.setLayoutType('normal', 'startcol')
		entityField.setMandatory(true)

		var fileField = form.addField('file', 'file', 'Select File');
		fileField.setMandatory(true)

		form.addSubmitButton();
		form.addResetButton();
		response.writePage(form);
	} else {
		var entity = request.getParameter("entity");
		var file = request.getFile("file");
		nlapiLogExecution('DEBUG', 'file', file.getValue());
		// set the folder where this file will be added. In this case, 10 is the
		// internal ID
		// of the SuiteScripts folder in the NetSuite file cabinet
		file.setFolder(10)

		// Create file and upload it to the file cabinet.
		var id = nlapiSubmitFile(file)

		// Attach file to customer record
		nlapiAttachRecord("file", id, "customer", entity)

		// Navigate to customer record
		response.sendRedirect('record', 'customer', entity)
	}
}