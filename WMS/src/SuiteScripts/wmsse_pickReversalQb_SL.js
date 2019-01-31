/**
 * Script Description
 * This script used to reverse item receipts for selected order put away tasks/item receipts.
 */

/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

function pickReversalQbSuitelet(request, response){
	if (request.getMethod() == 'GET') 
	{
		var form = nlapiCreateForm('Pick Reversal');
		form.setScript('customscript_wmsse_pickreversal_cl');
		var TranTypeField = form.addField('custpage_trantype', 'select', 'Transaction Type').setLayoutType('startrow', 'none');
		var whLocation = form.addField('custpage_qbwhlocation', 'select', 'Location').setMandatory(true);

		whLocation.addSelectOption("","");

		var vRolebasedLocation = getRoledBasedLocation();

		
		var roleBasedLocationArray=getLocationName(vRolebasedLocation);

		if(roleBasedLocationArray != null && roleBasedLocationArray != '' && roleBasedLocationArray != 'null')
		{
			for (var j = 0; roleBasedLocationArray != null && j < roleBasedLocationArray.length; j++) {
				if(roleBasedLocationArray[j][0] != null && roleBasedLocationArray[j][0] != "" && roleBasedLocationArray[j][0] != " ")
				{
					var tslocation = form.getField('custpage_qbwhlocation').getSelectOptions(roleBasedLocationArray[j][0], 'is');
					if (tslocation != null) {
						if (tslocation.length > 0) {
							continue;
						}
					}
					whLocation.addSelectOption(roleBasedLocationArray[j][0], roleBasedLocationArray[j][1]);
				}
			}
		}
		//Setting location value as default if the subsidiary have only one location.
		if(vRolebasedLocation.length==1)
		{
			whLocation.setDefaultValue(vRolebasedLocation[0]);	
		}
		TranTypeField.addSelectOption('salesorder', 'Sales Order');
		TranTypeField.addSelectOption('transferorder', 'Transfer Order');		
		TranTypeField.setDefaultValue('salesorder'); 
		var orderField = form.addField('custpage_order', 'text', 'Transaction #'); 
		var pickreportField = form.addField('custpage_pickreport', 'text', 'Pick Report #'); 
		var button = form.addSubmitButton('Display');

		response.writePage(form);
	}
	else
	{
		var form = nlapiCreateForm('Pick Reversal');
		form.setScript('customscript_wmsse_pickreversal_cl');
		var ordId = "";
		var pickreport = "";
		var vTrantype="";
		var vLocation="";
		var msg = form.addField('custpage_message', 'inlinehtml', null, null, null);
		msg.setLayoutType('outside','startcol');
		var whLocation = form.addField('custpage_qbwhlocation', 'select', 'Location').setMandatory(true);

		whLocation.addSelectOption("","");

		var vRolebasedLocation = getRoledBasedLocation();

		
		var roleBasedLocationArray=getLocationName(vRolebasedLocation);

		if(roleBasedLocationArray != null && roleBasedLocationArray != '' && roleBasedLocationArray != 'null')
		{
			for (var j = 0; roleBasedLocationArray != null && j < roleBasedLocationArray.length; j++) {
				if(roleBasedLocationArray[j][0] != null && roleBasedLocationArray[j][0] != "" && roleBasedLocationArray[j][0] != " ")
				{
					var tslocation = form.getField('custpage_qbwhlocation').getSelectOptions(roleBasedLocationArray[j][0], 'is');
					if (tslocation != null) {
						if (tslocation.length > 0) {
							continue;
						}
					}
					whLocation.addSelectOption(roleBasedLocationArray[j][0], roleBasedLocationArray[j][1]);
				}
			}
		}
		if(request.getParameter('custpage_qbwhlocation')!='' && request.getParameter('custpage_qbwhlocation')!=null)
		{
			whLocation.setDefaultValue(request.getParameter('custpage_qbwhlocation'));	
		}
		if(vRolebasedLocation.length==1)
		{
			whLocation.setDefaultValue(vRolebasedLocation[0]);	
		}
		var TranTypeField = form.addField('custpage_trantype', 'select', 'Transaction Type').setLayoutType('startrow', 'none');
		TranTypeField.addSelectOption('salesorder', 'Sales Order');
		TranTypeField.addSelectOption('transferorder', 'Transfer Order');		
		TranTypeField.setDefaultValue('salesorder'); 
		var orderField = form.addField('custpage_order', 'text', 'Transaction #'); 
		var pickreportField = form.addField('custpage_pickreport', 'text', 'Pick Report #'); 
		var button = form.addSubmitButton('Display');
		if(request.getParameter('custpage_trantype') != null && request.getParameter('custpage_trantype') != '')
		{	
			vTrantype=request.getParameter('custpage_trantype');
			TranTypeField.setDefaultValue(vTrantype); 
		}
		if(request.getParameter('custpage_order') != null && request.getParameter('custpage_order') != '')
		{	
			ordId=request.getParameter('custpage_order');
			orderField.setDefaultValue(ordId); 
		}
		if(request.getParameter('custpage_pickreport') != null && request.getParameter('custpage_pickreport') != '')
		{	
			pickreport=request.getParameter('custpage_pickreport');
			pickreportField.setDefaultValue(pickreport); 
		}
		if(request.getParameter('custpage_qbwhlocation') != null && request.getParameter('custpage_qbwhlocation') != '')
		{	
			vLocation=request.getParameter('custpage_qbwhlocation');
			
		}
		var ordIntId='';
		if(ordId != '' && ordId != 'null' && ordId != null && ordId != 'undefined')
		{
			ordIntId = GetOrdId(ordId,vTrantype);
			if(ordIntId == -1 && pickreport == '')
			{
				msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Error', 'Invalid transaction#.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");

				response.writePage(form);
				return;
			}
		}
		if(ordIntId != -1 || ordIntId == '')
		{
			var resultArr = GetOrdInternalId(ordIntId,pickreport,vTrantype);

			if(resultArr != null && resultArr != '' && resultArr != 'null' && resultArr.length > 0)
			{
				var ordArray = new Array();		
				ordArray["custpage_order"] = ordIntId;
				ordArray["custpage_pickreport"] = pickreport;
				ordArray["custpage_trantype"] = vTrantype;
				ordArray["custpage_qbwhlocation"] = vLocation;
				response.sendRedirect('SUITELET', 'customscript_wmsse_gui_pickreversal','customdeploy_wmsse_gui_pickreversal', false, ordArray);
				return;

			}
			else
			{				
				var SORecinternalids=new Array();
				var objclosedtaskList = new nlapiLoadSearch('customrecord_wmsse_trn_closedtask', 'customsearch_wmsse_closedtaskreversal');
				if(pickreport != '' && pickreport != 'null' && pickreport != null && pickreport != 'undefined')
				{
					objclosedtaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_pickreport_no_clt',null,'is',pickreport));
				}
				if(ordIntId != '' && ordIntId != 'null' && ordIntId != null && ordIntId != 'undefined')
				{
					objclosedtaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no_clt',null,'anyof',ordIntId));
				}
				objclosedtaskList.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype_clt',null,'anyof',['3']));

				var resLenDetails = objclosedtaskList.runSearch();
				
				
				var resultsPage = resLenDetails.getResults(0, 1000);
				var offset = 0;
				while (!!resultsPage && resultsPage.length > 0) 
				{
					SORecinternalids = SORecinternalids.concat(resultsPage);
					offset += 1000;
					resultsPage = resLenDetails.getResults(offset, offset + 1000);
				}


				if(SORecinternalids == null || SORecinternalids == '' || SORecinternalids=='null' || SORecinternalids == 'undefined')
				{
					if( pickreport !='' && ordIntId == -1)
					{
						msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Error', 'Invalid transaction and pickreport details', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
					}
					else if( pickreport !='')
					{
						msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Error', 'Invalid  pickreport#', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
					}
					else
						msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Error', 'All the items in the order are reversed/not yet picked.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
				}
				else
				{
                   
                    	  msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Error', 'The order has been shipped.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>"); 
                 

				}

			}
		}
		else
		{
			
				msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Error', 'No records available for selected criteria.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
		}
		response.writePage(form);
	}
}

function GetOrdInternalId(OrdText,pickReportNo,TranType)
{
	var logMsg1 = 'OrdText =' + OrdText + '<br>';
	logMsg1 = logMsg1 + 'pickReportNo = ' + pickReportNo + '<br>';
	logMsg1 = logMsg1 + 'TranType = ' + TranType + '<br>';
	nlapiLogExecution('DEBUG', 'parameters ', logMsg1);

	var ActualOrdID=new Array();
	var SORecinternalids=new Array();
	var OTsearchresult = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_opentaskdetails_srh');
	
	if(pickReportNo != '' && pickReportNo != 'null' && pickReportNo != null && pickReportNo != 'undefined')
	{
		OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_pickreport_no',null,'is',pickReportNo));
	}
	if(OrdText != '' && OrdText != 'null' && OrdText != null && OrdText != 'undefined')
	{

		OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no',null,'anyof',OrdText));
	}
	OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',null,'anyof',['28','8']));
	OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype',null,'anyof',['3']));


	var resLenDetails = OTsearchresult.runSearch();
	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) 
	{
		SORecinternalids = SORecinternalids.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}

	if(SORecinternalids != null && SORecinternalids != '' && SORecinternalids != 'null' && SORecinternalids.length > 0)
	{
		for(var k=0;k<SORecinternalids.length;k++)
		{
			ActualOrdID.push(SORecinternalids[k].getValue('custrecord_wmsse_order_no'));
		}
	}



	return ActualOrdID;
}
function GetOrdId(OrdText,TranType)
{
	nlapiLogExecution('DEBUG','Into GetOrdInternalId (Input)',OrdText);

	var ActualOrdID='-1';

	var filter=new Array();
	filter.push(new nlobjSearchFilter('tranid',null,'is',OrdText.toString()));
	filter.push(new nlobjSearchFilter('mainline',null,'is','T'));

	var searchrec=nlapiSearchRecord(TranType,null,filter,null);	 
	if(searchrec!=null && searchrec!='' && searchrec.length>0)
	{
		ActualOrdID=searchrec[0].getId();
	}

	nlapiLogExecution('DEBUG','Out of GetOrdInternalId (Output)',ActualOrdID);

	return ActualOrdID;
}