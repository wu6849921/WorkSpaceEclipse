/**
 * Script Description
 * This script is used to show the error logd for scheduler process.
 */
/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function errorLogDisplay(request, response)
{
	var context = nlapiGetContext();
	var size = context.getPreference('LISTSEGMENTSIZE');
	nlapiLogExecution('ERROR','size',size);
	if(size == null || size == '' || size == undefined || size == 0)
		size = 50;

	try
	{
		var form = nlapiCreateForm('Error Log Details');
		form.setScript('customscript_wmsse_errorlog_client');

		var replenRefNum = request.getParameter('custparam_schrefno');
		var processName = request.getParameter('custrecord_wmsse_schprsname');
		var userId = request.getParameter('custparam_userid');

		nlapiLogExecution('ERROR','replenRefNum,userId',replenRefNum+','+userId);

		var msg = form.addField('custpage_message', 'inlinehtml', null, null, null).setLayoutType('outside','startrow');

		var hdnRefNum = form.addField('custparam_schrefno','longtext','Reference #').setDisplayType("hidden");//adds hidden field to the form
		if(request.getParameter('custparam_schrefno') != null && request.getParameter('custparam_schrefno') != '')
		{
			hdnRefNum.setDefaultValue(request.getParameter('custparam_schrefno'));
		}
		else
		{
			hdnRefNum.setDefaultValue(replenRefNum);
		}

		var hdnUserId = form.addField('custparam_userid','longtext','User Id').setDisplayType("hidden");//adds hidden field to the form
		if(request.getParameter('custparam_userid') != null && request.getParameter('custparam_userid') != '')
		{
			hdnUserId.setDefaultValue(request.getParameter('custparam_userid'));
		}
		else
		{
			hdnUserId.setDefaultValue(userId);
		}

		var hdnProcessName = form.addField('custrecord_wmsse_schprsname','longtext','Process Name').setDisplayType("hidden");//adds hidden field to the form
		if(request.getParameter('custrecord_wmsse_schprsname') != null && request.getParameter('custrecord_wmsse_schprsname') != '')
		{
			hdnProcessName.setDefaultValue(request.getParameter('custrecord_wmsse_schprsname'));
		}
		else
		{
			hdnProcessName.setDefaultValue(processName);
		}

		var hdnselect= form.addField('custpage_hiddenfieldselectpage','checkbox','Validate Select').setDisplayType("hidden");

		addSublistToForm(form);//to add sublist to the form

		var resultsArray = [];
		var maxno = -1;
		resultsArray = fnGetErrorLogDetails(replenRefNum, userId, resultsArray, maxno);//to retrieve any number of results from error log table

		if(resultsArray != null && resultsArray != '' && resultsArray.length>0)
		{
			nlapiLogExecution('ERROR','resultsArray ',resultsArray.length);
			nlapiLogExecution('ERROR','resultsArray ',resultsArray);

			//var size = 500;						
			if(resultsArray.length > parseInt(size))
			{	
				var select= form.addField('custpage_selectpage','select', 'Select Items');	
				select.setLayoutType('outsidebelow');			
				select.setDisplaySize(200,30);

				if(request.getParameter('custpage_selectpage') != null &&
						request.getParameter('custpage_selectpage') != 'null' &&
						request.getParameter('custpage_selectpage') != '' &&
						request.getParameter('custpage_selectpage') != 'undefined')
				{
					select.setDefaultValue(request.getParameter('custpage_selectpage'));	
				}

				var pagetLength = resultsArray.length/parseInt(size);
				for(var pageIterator = 1; pageIterator <= Math.ceil(pagetLength); pageIterator++)
				{
					var from;var to;

					to=parseFloat(pageIterator)*parseInt(size);
					from=(parseFloat(to)-parseInt(size))+1;
					if(parseFloat(to)>resultsArray.length)
					{
						to=resultsArray.length;
					}

					var selectvalues=from.toString()+" to "+to.toString();
					var selectvalues_display=from.toString()+","+to.toString();
					select.addSelectOption(selectvalues_display,selectvalues);
				}//Setting values to Paging Dropdown box
			}

			var minval=0;
			var maxval=parseFloat(resultsArray.length)-1;
			var selectno=request.getParameter('custpage_selectpage');
			nlapiLogExecution('Error','selectno', selectno);

			if(selectno!=null && selectno!='null'  && selectno!=undefined &&
					selectno!= '' && resultsArray.length > parseInt(size))
			{
				var selectedPageArray = [];
				var selectedPage= request.getParameter('custpage_selectpage');
				if(selectedPage != '' && selectedPage != null)
					selectedPageArray=selectedPage.split(',');

				minval = parseFloat(selectedPageArray[0])-1;

				if(parseFloat(resultsArray.length) >= parseFloat(selectedPageArray[1]))
				{
					maxval=parseFloat(selectedPageArray[1])-1;
				}

			}
			else
			{
				if(resultsArray.length > parseInt(size))
				{
					maxval = parseInt(size)-1;
				}
			}
			nlapiLogExecution('Error','minval, maxval', minval+', '+maxval);
			var sublistItr = 1;

			for(var listItr = minval; listItr <= maxval; listItr++)
			{
				var item = resultsArray[listItr].getText('custrecord_wmsse_error_ref1');
				var preferBin = resultsArray[listItr].getText('custrecord_wmsse_error_ref2');
				var user = resultsArray[listItr].getText('custrecord_wmsse_error_user');
				var whLocation = resultsArray[listItr].getText('custrecord_wmsse_error_location');
				var errorMsg = resultsArray[listItr].getValue('custrecord_wmsse_error_exception');

				//form.getSubList('custpage_items').setLineItemValue('custpage_processname', sublistItr, 'Generate Replenishment');
				form.getSubList('custpage_items').setLineItemValue('custpage_processname', sublistItr, processName);
				form.getSubList('custpage_items').setLineItemValue('custpage_sku', sublistItr, item);
				form.getSubList('custpage_items').setLineItemValue('custpage_preferbin', sublistItr, preferBin);
				form.getSubList('custpage_items').setLineItemValue('custpage_whlocation', sublistItr, whLocation);
				form.getSubList('custpage_items').setLineItemValue('custpage_assigneduser', sublistItr, user);
				form.getSubList('custpage_items').setLineItemValue('custpage_errormsg', sublistItr, errorMsg);
				sublistItr++;
			}
		}

		form.addSubmitButton('Close');
		response.writePage(form);
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

		nlapiLogExecution('ERROR', 'Exception in errorLogDisplay',errStr);

		msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
				"showAlertBox('div__alert', 'Error', '"+errStr+"'," +
				" NLAlertDialog.TYPE_HIGH_PRIORITY," +
		"  '100%', null, null, null);</script></div>");

		form.addSubmitButton('Close');
		response.writePage(form);
		return;
	} 
}

/**
 * 
 * @param form object
 * To bind sublist to the Error Log form
 */

function addSublistToForm(form)
{
	//Add Sublist to the Generate Replenishment form
	var sublist = form.addSubList("custpage_items", "list", "Error Log Details");

	sublist.addField("custpage_processname", "text", "Process Name");
	sublist.addField("custpage_assigneduser", "text", "User");
	sublist.addField("custpage_sku", "text", "Item");
	sublist.addField("custpage_preferbin", "text", "Preferred Bin");
	sublist.addField("custpage_whlocation", "text", "Location");
	sublist.addField("custpage_errormsg", "textarea", "Error");
}

/**
 * 
 * @returns Returns any number of records from the error log table based on the criteria.
 */
function fnGetErrorLogDetails(replenRefNum, userId, resultsArray, maxno)
{
	nlapiLogExecution('ERROR','replenRefNum,userId',replenRefNum+','+userId);
	var result = nlapiLoadSearch('customrecord_wmsse_errorlog', 'customsearch_wmsse_errorlog_srh');

	if(replenRefNum != null && replenRefNum != '' && replenRefNum != 'undefined' && replenRefNum != undefined)
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_error_tranref',null,'is', replenRefNum));

	if(userId!=null && userId!='' && userId!='undefined' && userId!='null' && userId!=undefined)
		result.addFilter(new nlobjSearchFilter('custrecord_wmsse_error_user',null, 'anyof', userId));

	if(maxno != -1 && maxno != null && maxno != '' && maxno != undefined)
		result.addFilter(new nlobjSearchFilter('internalidnumber', null,'greaterthan', parseInt(maxno)));

	var resLen = result.runSearch();

	var loadsrhItr = 0;
	var resultSet = resLen.forEachResult(function(searchResult)	
			{
		loadsrhItr++;
		resultsArray.push(searchResult);

		if(parseFloat(loadsrhItr) == 4000)
		{
			maxno = searchResult.getValue('internalid');
			fnGetErrorLogDetails(replenRefNum, userId, resultsArray, maxno);
			return false;
		}
		return true;                // return true to keep iterating
			});
	nlapiLogExecution('ERROR','resultsArray',resultsArray);
	return resultsArray;
}

function selectPage_fieldchanged(type,name)
{
	if(trim(name)==trim('custpage_selectpage'))
	{
		nlapiSetFieldValue('custpage_hiddenfieldselectpage','T');
		NLDoMainFormButtonAction("submitter",true);
	}
	else
	{
		return true;
	}

}//end of field change function

function OnSave(type,name)
{
	var hdnFlag = nlapiGetFieldValue('custpage_hiddenfieldselectpage');
	if(hdnFlag != 'T')
	{
		window.close();
	}
	return true;
}//end of OnSave
