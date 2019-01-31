/**
 * Script Description
 * This script is used to display and select the Cycle count templates.
 */

/***************************************************************************
 Copyright � 2017,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function cycleCountGeneration(request, response)
{
	if (request.getMethod() == 'GET') 
	{

		var form = nlapiCreateForm('Generate Cycle Count Plan');

		var ccPlanNo = form.addField('custpage_plannum', 'select', 'Plan Number');
		var endDate = form.addField('custpage_enddate', 'date', 'Count End Date');
		var startDate = form.addField('custpage_startdate', 'Date', 'Count Start Date');
		ccPlanNo.addSelectOption("","");

		var filters = new Array();

		filters.push(new nlobjSearchFilter('isinactive',null, 'is', 'F'));

		var cols = new Array();
		cols.push(new nlobjSearchColumn('name'));
		var results = nlapiSearchRecord('customrecord_wmsse_cyclecount_plan', 'customsearch_wmsse_cyccnt_template_srh', filters, cols);
		nlapiLogExecution('DEBUG', 'results',results);
		if(results != null && results != '')
		{
			ccPlanNo.setMandatory(true);
			nlapiLogExecution('DEBUG', 'results.length',results.length);
			for(var i=0;i<results.length;i++)
			{
				var id = results[i].getValue('name');
				nlapiLogExecution('DEBUG', 'id',id);
				ccPlanNo.addSelectOption(id,id);
			}
		}
		form.addSubmitButton('Display');
		response.writePage(form);

	}
	else{
		var ccPlanNo = request.getParameter('custpage_plannum');
		nlapiLogExecution('ERROR', 'ccPlanNo',ccPlanNo);
		var startDate = request.getParameter('custpage_startdate');
		var endDate = request.getParameter('custpage_enddate');


		var CCarray = new Array();
		CCarray['custpage_plannum'] = ccPlanNo;
		CCarray['custparam_startdate'] = startDate;
		CCarray['custparam_enddate'] = endDate;
		response.sendRedirect('SUITELET', 'customscript_wmsse_cc_planrelease',
				'customdeploy_wmsse_cc_planrelease', false, CCarray);
		return;
	}
}
