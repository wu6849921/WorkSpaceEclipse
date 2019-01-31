/**
 * Script Description
 * This script used to reverse item receipts for selected order put away tasks/item receipts.
 */

/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/

function InboundReversalQbSuitelet(request, response){
	if (request.getMethod() == 'GET') 
	{
		var form = nlapiCreateForm('Inbound Reversal');
		var TranTypeField = form.addField('custpage_trantype', 'select', 'Transaction Type').setLayoutType('startrow', 'none');
		TranTypeField.addSelectOption('purchaseorder', 'Purchase Order');
		TranTypeField.addSelectOption('transferorder', 'Transfer Order');
		TranTypeField.addSelectOption('returnauthorization', 'RMA');
		TranTypeField.setDefaultValue('purchaseorder'); 
		var orderField = form.addField('custpage_orderlist', 'text', 'Transaction #'); 
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
		var button = form.addSubmitButton('Display');


		response.writePage(form);
	}
	else
	{
		var form = nlapiCreateForm('Inbound Reversal');
		var ordId = "";
		var vTrantype="";
		var vLocation="";
		var msg = form.addField('custpage_message', 'inlinehtml', null, null, null);
		msg.setLayoutType('outside','startcol');
		if(request.getParameter('custpage_trantype') != null && request.getParameter('custpage_trantype') != '')
		{	
			vTrantype=request.getParameter('custpage_trantype');
		}
		if(request.getParameter('custpage_orderlist') != null && request.getParameter('custpage_orderlist') != '')
		{	
			ordId=GetOrdInternalId(request.getParameter('custpage_orderlist'),vTrantype);
		}
		if(request.getParameter('custpage_qbwhlocation')!='' && request.getParameter('custpage_qbwhlocation')!=null)
		{
			vLocation=request.getParameter('custpage_qbwhlocation');	
		}

		nlapiLogExecution('ERROR','ordId',ordId);

		//if(ordId != null && ordId != '' && ordId != '-1')
		{
			var ordArray = new Array();		
			ordArray["custpage_orderlist"] = ordId;
			ordArray["custpage_trantype"] = vTrantype;
			ordArray["custpage_whlocation"] = vLocation;
			response.sendRedirect('SUITELET', 'customscript_wmsse_inboundreversal','customdeploy_wmsse_inboundreversal', false, ordArray);

		}
		/*else
		{
			msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Error', 'No records available for selected criteria.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
		}*/
		response.writePage(form);
	}
}

function GetOrdInternalId(OrdText,TranType)
{
	
	var ActualOrdID='-1';

	var filter=new Array();
	filter.push(new nlobjSearchFilter('tranid',null,'is',OrdText.toString()));
	filter.push(new nlobjSearchFilter('mainline',null,'is','T'));

	var searchrec=nlapiSearchRecord(TranType,'customsearch_wmsse_transactionid_details',filter,null);	 
	if(searchrec!=null && searchrec!='' && searchrec.length>0)
	{
		ActualOrdID=searchrec[0].getId();
	}

	
	return ActualOrdID;
}
