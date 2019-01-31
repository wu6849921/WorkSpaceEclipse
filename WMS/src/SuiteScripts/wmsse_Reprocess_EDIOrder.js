/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function ReprocessEDIOrder(request, response){
	if (request.getMethod() == 'GET')
	{
		var form = nlapiCreateForm('Reprocess EDI');
		var OrdNumber = form.addField('custpage_wmsse_orderno', 'text', 'Sales Order').setMandatory(true);
		form.addSubmitButton('Submit');
		response.writePage(form);
	}
	else 
	{
		var form = nlapiCreateForm('Reprocess EDI');
		var OrdNumber = form.addField('custpage_wmsse_orderno', 'text', 'Sales Order').setMandatory(true);		
		var vOrdNumber = request.getParameter('custpage_wmsse_orderno');
		nlapiLogExecution('ERROR', 'ReprocessEDIOrder vOrdNumber', vOrdNumber);

		var param = new Array();
		param['custscript_wmsse_orderno'] = vOrdNumber;		
		nlapiScheduleScript('customscript_ebiz_custom_sch_7', null,param);

		form.addSubmitButton('Submit');
		showInlineMessage(form, 'Confirmation', 'Reprocessing has been initiated for Order '+ vOrdNumber);
		response.writePage(form);
	}
}