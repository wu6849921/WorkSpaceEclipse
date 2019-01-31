/**
 * Script Description
 * This script is used for manual Packing GUI process.
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * Main function for packing process
 */
function fnBinWorkSheet(request, response){
	if (request.getMethod() == 'GET') {
		nlapiLogExecution('ERROR', 'into', 'Get');
		var form = nlapiCreateForm('Bin Putaway Worksheet');
		var soField = form.addField('custpage_location', 'select', 'Location','location').setMandatory(true);		 

		form.addSubmitButton('Submit');
		response.writePage(form);
	}
	else {
		var form = nlapiCreateForm('Bin Putaway Worksheet');

		nlapiLogExecution('ERROR', 'into', 'response');				  

		var vWHLocation=request.getParameter('custpage_location');
		
		var soField = form.addField('custpage_location', 'select', 'Location','location').setMandatory(true);
		
		var msg = form.addField('custpage_message', 'inlinehtml', null, null, null).setLayoutType('outside','startrow');
		
		form.addSubmitButton('Submit');
		var param = new Array();
		param['custscript_wmsse_whloc'] = vWHLocation; 

		nlapiLogExecution('ERROR','Before Scheduler initiated');
		nlapiScheduleScript('customscript_wmsse_binput_worksheet_sch', null,param); 

		nlapiLogExecution('ERROR','After Scheduler initiated');
		msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', 'Bin putaway Worksheet scheduler process was initiated.', NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null, null, null);</script></div>");
		response.writePage(form);	


	}
}