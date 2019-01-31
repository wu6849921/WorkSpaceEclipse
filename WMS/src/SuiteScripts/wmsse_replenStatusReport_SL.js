/**
 * Script Description
 * This script is used to display Schedule script status.
 */
/***************************************************************************
 Copyright � 2017,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function SchedulerStatus(request, response)
{
	var context = nlapiGetContext();
	if (request.getMethod() == 'GET') 
	{
		var form = nlapiCreateForm('Scheduler Status Report');//Creates GUI Form

		var msg = form.addField('custpage_message', 'inlinehtml', null, null, null).setLayoutType('outside','startrow');

		var vSchedulerStatusType = form.addField('custpage_schedulerstatustype', 'select', 'Process Name');//Adds select field to the form
		vSchedulerStatusType.addSelectOption('1', 'Generate Replenishment');//adds option to the select field

		if(request.getParameter('vSchedulerStatusType')!='' && request.getParameter('vSchedulerStatusType')!=null)
		{
			vSchedulerStatusType.setDefaultValue( request.getParameter('vSchedulerStatusType') );
		}

		form.addField('custpage_fromdate', 'date', 'Scheduler Begin Date');//Adds date field to the form

		var vTranNumber=form.addField('custpage_tranrefnumber','text','Transaction Ref #');//Adds text field to the form

		var assainedTo = form.addField('custpage_assainedto', 'select', 'Initiated By','Employee');//Adds select field to the form

		form.addField('custpage_todate', 'date', 'Scheduler End Date');//Adds date field to the form

		form.addSubmitButton('Display');//Adds submit button to the form
		response.writePage(form);
	}
	else
	{
		try
		{
			var form = nlapiCreateForm('Scheduler Status Report');//Creates GUI Form

			var vQbRefNo = request.getParameter('custpage_tranrefnumber');
			var vQbFromDate = request.getParameter('custpage_fromdate');
			var statusType = request.getParameter('custpage_schedulerstatustype');
			var vQbEndDate = request.getParameter('custpage_todate');
			var vInitUser = request.getParameter('custpage_assainedto');
			var REarray = new Array();
			REarray['custpage_ordstatus'] = statusType;

			nlapiLogExecution('ERROR','statusType ',statusType);
			nlapiLogExecution('ERROR','vQbRefNo : vQbFromDate ',vQbRefNo+" : "+vQbFromDate);

			var msg = form.addField('custpage_message', 'inlinehtml', null, null, null).setLayoutType('outside','startrow');

			var vSchedulerStatusType = form.addField('custpage_schedulerstatustype', 'select', 'Process Name');//Adds select field to the form
			vSchedulerStatusType.addSelectOption('1', 'Generate Replenishment');//adds option to the select field

			if(vSchedulerStatusType != '' && vSchedulerStatusType != null)
			{
				vSchedulerStatusType.setDefaultValue(vSchedulerStatusType);
			}

			var vFromDate = form.addField('custpage_fromdate', 'date', 'Scheduler Begin Date');//Adds date field to the form
			if(vQbFromDate !=null && vQbFromDate !='')
				vFromDate.setDefaultValue(vQbFromDate);

			var vTranNumber=form.addField('custpage_tranrefnumber','text','Transaction Ref #');//Adds text field to the form
			if(vQbRefNo !=null && vQbRefNo !='')
				vTranNumber.setDefaultValue(vQbRefNo);

			var assainedTo = form.addField('custpage_assainedto', 'select', 'Initiated By','Employee');//Adds select field to the form
			if(vInitUser !=null && vInitUser !='')
				assainedTo.setDefaultValue(vInitUser);

			var vToDate = form.addField('custpage_todate', 'date', 'Scheduler End Date');//Adds date field to the form
			if(vQbEndDate !=null && vQbEndDate !='')
				vToDate.setDefaultValue(vQbEndDate);

			if(request.getParameter('custpage_schedulerstatustype') != '' && request.getParameter('custpage_schedulerstatustype') != null 
					&& request.getParameter('custpage_schedulerstatustype') == '1')
			{
				//Below code is to create a sublist
				var sublist = form.addSubList("custpage_items", "list", "Scheduler List");
				sublist.addField("custpage_processname", "text", "Process Name");
				sublist.addField("custpage_transaction", "text", "Transaction Ref #");
				sublist.addField("custpage_initiatedby", "textarea", "Initiated by");
				sublist.addField("custpage_schstatus", "text", "Scheduler Status");
				sublist.addField("custpage_begindate", "date", "Begin Date");
				sublist.addField("custpage_enddate", "date", "End Date");
				sublist.addField("custpage_remarks", "textarea", "Remarks");
				sublist.addField("custpage_schstatus_link", "textarea", "Error Log");

				var schedulersearchresult = [];
				var maxno = -1;
				var schStatus="";
				var vremarks ='';
				schedulersearchresult = fnGetSchInfoResults(vQbRefNo,vQbFromDate,vQbEndDate,vInitUser,schedulersearchresult,maxno);
				//This function is to retrieve all the scheduler status record results.
				nlapiLogExecution('ERROR', 'schedulersearchresult',schedulersearchresult);
				if(schedulersearchresult != null && schedulersearchresult != '')
				{
					for(var schItr = 0; schItr < schedulersearchresult.length; schItr++)
					{
						var internalId= schedulersearchresult[schItr].getValue('internalid');
						schStatus = schedulersearchresult[schItr].getValue('custrecord_wmsse_schprsstatus');
						var errorNotes = schedulersearchresult[schItr].getValue('custrecord_wmsse_schprsnotes');
						var vTransactionNo = schedulersearchresult[schItr].getValue('custrecord_wmsse_schprstranrefno');
						var vInitiatedBy = schedulersearchresult[schItr].getText('custrecord_wmsse_schprsinitiatedby');
						var vUserId = schedulersearchresult[schItr].getValue('custrecord_wmsse_schprsinitiatedby');
						var vBeginDate = schedulersearchresult[schItr].getValue('custrecord_wmsse_schprsbegindate');
						var vEndDate = schedulersearchresult[schItr].getValue('custrecord_wmsse_schprsenddate');
						var vProcessName = schedulersearchresult[schItr].getValue('custrecord_wmsse_schprsname');

						if(schStatus=='Completed')
						{
							var errFilters = new Array();

							if(vTransactionNo != null && vTransactionNo != '')
								errFilters.push(new nlobjSearchFilter('custrecord_wmsse_error_tranref',null,'is', vTransactionNo));

							if(vUserId != null && vUserId != '')
								errFilters.push(new nlobjSearchFilter('custrecord_wmsse_error_user',null, 'anyof', vUserId));

							var errLogDetails = nlapiSearchRecord('customrecord_wmsse_errorlog', 'customsearch_wmsse_errorlog_srh',errFilters, null);
							if(errLogDetails != null && errLogDetails != '' && errLogDetails != undefined)
							{
								var	linkUrl = nlapiResolveURL('SUITELET', 'customscript_wmsse_errorlog_info', 'customdeploy_wmsse_errorlog_info_deploy');
								linkUrl = linkUrl + '&custparam_schrefno=' + vTransactionNo + '&custparam_userid=' + vUserId + '&custrecord_wmsse_schprsname=' + vProcessName;

								//below code is to add rows to the sublist
								form.getSubList('custpage_items').setLineItemValue('custpage_processname', schItr+1, vProcessName);

								form.getSubList('custpage_items').setLineItemValue('custpage_transaction', schItr+1, vTransactionNo);	

								form.getSubList('custpage_items').setLineItemValue('custpage_schstatus',schItr+1, schStatus);

								form.getSubList('custpage_items').setLineItemValue('custpage_initiatedby',schItr+1, vInitiatedBy);

								form.getSubList('custpage_items').setLineItemValue('custpage_begindate',schItr+1, vBeginDate);

								form.getSubList('custpage_items').setLineItemValue('custpage_enddate',schItr+1, vEndDate);

								form.getSubList('custpage_items').setLineItemValue('custrecord_wmsse_schprsnotes',schItr+1, errorNotes);

								form.getSubList('custpage_items').setLineItemValue('custpage_schstatus_link', schItr+1,"<a href='"+linkUrl +"' target='_blank'>Error Log</a>");
							}
							else
							{
								//below code is to add rows to the sublist
								form.getSubList('custpage_items').setLineItemValue('custpage_processname', schItr+1, vProcessName);

								form.getSubList('custpage_items').setLineItemValue('custpage_transaction', schItr+1, vTransactionNo);	

								form.getSubList('custpage_items').setLineItemValue('custpage_schstatus',schItr+1, schStatus);

								form.getSubList('custpage_items').setLineItemValue('custpage_initiatedby',schItr+1, vInitiatedBy);

								form.getSubList('custpage_items').setLineItemValue('custpage_begindate',schItr+1, vBeginDate);

								form.getSubList('custpage_items').setLineItemValue('custpage_enddate',schItr+1, vEndDate);

								form.getSubList('custpage_items').setLineItemValue('custrecord_wmsse_schprsnotes',schItr+1, errorNotes);
							}
						}
						else
						{		
							//below code is to add rows to the sublist
							form.getSubList('custpage_items').setLineItemValue('custpage_processname', schItr+1, vProcessName);

							form.getSubList('custpage_items').setLineItemValue('custpage_transaction', schItr+1, vTransactionNo);	

							form.getSubList('custpage_items').setLineItemValue('custpage_schstatus',schItr+1, schStatus);

							form.getSubList('custpage_items').setLineItemValue('custpage_initiatedby',schItr+1, vInitiatedBy);

							form.getSubList('custpage_items').setLineItemValue('custpage_begindate',schItr+1, vBeginDate);

							form.getSubList('custpage_items').setLineItemValue('custpage_enddate',schItr+1, vEndDate);

							form.getSubList('custpage_items').setLineItemValue('custrecord_wmsse_schprsnotes',schItr+1, errorNotes);
						}

						if(context.getRemainingUsage() < 20)
							break;
					}

				}
				else
				{
					nlapiLogExecution('ERROR', 'No results found');
				}
			}

			form.addSubmitButton('Display');//Adds submit button to the form
			response.writePage(form);
			return;
		}
		catch(e)
		{
			var errStr = '';
			if (e instanceof nlobjError) 
			{	
				errStr = 'System error: ' + e.getCode() + '\n' + e.getDetails();
			}
			else
			{
				errStr = 'Unexpected error: ' + e.toString();
			}

			nlapiLogExecution('ERROR', 'Exception in SchedulerStatus',errStr);

			msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
					"showAlertBox('div__alert', 'Error', '"+errStr+"'," +
					" NLAlertDialog.TYPE_HIGH_PRIORITY," +
			"  '100%', null, null, null);</script></div>");

			form.addSubmitButton('Display');
			response.writePage(form);
			return;
		}
	}
}

/**
 * 
 * @returns Returns any number of records from the Scheduler status table based on the criteria.
 */
function fnGetSchInfoResults(vQbRefNo,vQbFromDate,vQbEndDate,vInitUser,schedulersearchresult,maxno)
{
	var str = 'vQbRefNo.' + vQbRefNo + '<br/>';
	str = str + 'vQbFromDate.' + vQbFromDate + '<br/>';
	str = str + 'vQbEndDate.' + vQbEndDate + '<br/>';
	str = str + 'vInitUser.' + vInitUser + '<br/>';
	str = str + 'schedulersearchresult.' + schedulersearchresult + '<br/>';
	str = str + 'maxno.' + maxno + '<br/>';
	nlapiLogExecution('ERROR', 'str',str);

	var result = nlapiLoadSearch('customrecord_wmsse_schscripts_status','customsearch_wmsse_sch_status_srh');

	if(vQbRefNo != null && vQbRefNo != '' && vQbRefNo != 'undefined' && vQbRefNo != undefined)
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_schprstranrefno',null,'is',vQbRefNo));

	if(vQbFromDate!=null && vQbFromDate!='' && vQbFromDate!='undefined' && vQbFromDate!='null' && vQbFromDate!=undefined)
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_schprsbegindate',null,'onorafter',vQbFromDate));

	if(vQbEndDate !=null && vQbEndDate !='' && vQbEndDate != undefined)
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_schprsenddate',null,'onorbefore',vQbEndDate));

	if(vInitUser !=null && vInitUser !='' && vInitUser != undefined)
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_schprsinitiatedby',null,'anyof',vInitUser));

	//result.addFilter(new nlobjSearchFilter('custrecord_wmsse_schprsname',null,'is','Generate Replenishment'));

	if(maxno != -1 && maxno != null && maxno != '' && maxno != undefined)
		result.addFilter(new nlobjSearchFilter('internalidnumber', null,'lessthan', parseInt(maxno)));

	var resLen = result.runSearch();

	var loadsrhItr = 0;
	var resultSet = resLen.forEachResult(function(searchResult)	
			{
		loadsrhItr++;
		schedulersearchresult.push(searchResult);

		if(parseFloat(loadsrhItr) == 4000)
		{
			maxno = searchResult.getValue('internalid');
			fnGetSchInfoResults(vQbRefNo,vQbFromDate,vQbEndDate,vInitUser,schedulersearchresult,maxno);
			return false;//to get out of the loop
		}
		return true;                // return true to keep iterating
			});
	nlapiLogExecution('ERROR','schedulersearchresult',schedulersearchresult);
	return schedulersearchresult;	
}