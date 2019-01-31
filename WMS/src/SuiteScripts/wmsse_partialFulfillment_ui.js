/**
 * Script Description
 * This script is to post fulfillment for partially picked Orders
 */
/***************************************************************************
  Copyright � 2017,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/
/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function partialFulfillment(request, response)
{
	var context = nlapiGetContext();

	if (request.getMethod() == 'GET') 
	{
		var form = nlapiCreateForm('Post Item Fulfillment: Partially-Picked Orders');
		createForm(form);//To add required fields to the form
		response.writePage(form);
		//end of if
	}
	else 
	{
		try
		{
			var form = nlapiCreateForm('Post Item Fulfillment: Partially-Picked Orders');
			createForm(form);//To add required fields to the form
			var msg = form.addField('custpage_message', 'inlinehtml', null, null, null);
			msg.setLayoutType('outside','startcol');

			var SOArray = new Array();
			SOArray['custpage_qbwhlocation'] = request.getParameter('custpage_qbwhlocation');
			SOArray['custpage_qbtransaction'] = request.getParameter('custpage_qbtransaction');
			SOArray['custpage_qbtrantype'] = request.getParameter('custpage_qbtrantype');
			SOArray['custpage_qbordertype'] = request.getParameter('custpage_qbordertype');
			SOArray['custpage_qbitem'] = request.getParameter('custpage_qbitem');
			SOArray['custpage_qbcustomer'] = request.getParameter('custpage_qbcustomer');
			SOArray['custpage_qbshipdate'] = request.getParameter('custpage_qbshipdate');
			SOArray['custpage_qbshipmethod'] = request.getParameter('custpage_qbshipmethod');
			SOArray['custpage_qbemployee'] = request.getParameter('custpage_qbemployee');

			var soNumber = request.getParameter('custpage_qbtransaction');
			var tranType = request.getParameter('custpage_qbtrantype');
			var loc = request.getParameter('custpage_qbwhlocation');
			nlapiLogExecution('ERROR', 'loc',loc);

			var FOatOrderLevel = getSystemRuleValue('Consolidate item fulfillments by sales order?',loc);
			//This function is to fetch System rule value
			var packValue = getSystemRuleValue('Manually pack orders?',loc);
			//This function is to fetch System rule value
			nlapiLogExecution('ERROR', 'FOatOrderLevel,packValue',FOatOrderLevel+','+packValue);

			if(FOatOrderLevel == 'Y' && (packValue == 'N' || packValue == '' || packValue == null))
			{
				if(soNumber != null && soNumber != '' && soNumber != 'null')
				{
					var tranId = getSOId(soNumber,tranType);
					//This function is to fetch Transaction internalid
					nlapiLogExecution('ERROR', 'tranId',tranId);

					if(tranId == null || tranId =='')
					{
						msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
								"showAlertBox('div__alert','ERROR','Enter a valid transaction number.',"+
						" NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
						response.writePage(form);
						return;
					}
				}

				response.sendRedirect('SUITELET', 'customscript_wmsse_post_if_partialord',
						'customdeploy_wmsse_post_if_partialord', false, SOArray);
				return;
			}
			else
			{
				msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
						"showAlertBox('div__alert', 'ERROR', 'Your system rules must be configured" +
						" to automatically pack orders and" +
						" consolidate item fulfillments by sales order.', NLAlertDialog.TYPE_HIGH_PRIORITY," +
				"  '100%', null, null, null);</script></div>");
			}
		}
		catch(e)
		{
			var errStr = e.toString();
			msg.setDefaultValue("<div id='div__alert' align='center'></div><script>" +
					"showAlertBox('div__alert', 'ERROR', '"+errStr+"'," +
			" NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
		}
		response.writePage(form);
	}//end of else
}//end of function

/**
 * This function is to generate ship methods based on Location
 * 
 */
function getShipmethods(location)
{

	var colsWorkstation = new Array();
	colsWorkstation[0] = new nlobjSearchColumn('custrecord_wmsse_carrier_nsmethod',null, 'group');
	var filters = new Array();
	if(location != null && location != '' && location !='null' && location != 'undefined')
	{
		filters.push(new nlobjSearchFilter('custrecord_wmsse_carrier_location',null, 'anyof',location));
	}
	var searchresults = nlapiSearchRecord('customrecord_wmsse_carrier', null, filters, colsWorkstation);

	return searchresults;
}

/**
 * This function is to create form
 * 
 */
function createForm(form)
{
	var whLocation = form.addField('custpage_qbwhlocation', 'select', 'Location').setMandatory(true);

	whLocation.addSelectOption("","");

	var vRolebasedLocation = getRoledBasedLocation();

	if(vRolebasedLocation==null || vRolebasedLocation=='' || vRolebasedLocation==0)
	{
		vRolebasedLocation = new Array();
		var filters=new Array();
		filters.push(new nlobjSearchFilter('custrecord_wmsse_make_wh_site', null, 'is', 'T'));
		//filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F')); 
		var searchresults = nlapiSearchRecord('location', 'customsearch_wmsse_locsearchresults', filters, null);
		if(searchresults != null && searchresults !='')
		{				
			for(var k=0;k<searchresults.length;k++)
			{
				vRolebasedLocation.push(searchresults[k].getId());
			}

		}
	}

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

	var tranType = form.addField('custpage_qbtrantype', 'select',
	'Transaction Type').setMandatory(true).setDisplaySize(150);

	tranType.addSelectOption("salesorder","Sales Order");
	tranType.addSelectOption("transferorder","Transfer Order");
	if(request.getParameter('custpage_qbtrantype')!='' && 
			request.getParameter('custpage_qbtrantype')!=null)
	{
		tranType.setDefaultValue(request.getParameter('custpage_qbtrantype'));	
	}

	var vTransaction = form.addField('custpage_qbtransaction', 'text', 'Transaction #');
	//vTransaction.setDisplaySize(41.5);
	if(request.getParameter('custpage_qbtransaction')!='' && 
			request.getParameter('custpage_qbtransaction')!=null)
	{
		vTransaction.setDefaultValue(request.getParameter('custpage_qbtransaction'));	
	}

	var OrderType = form.addField('custpage_qbordertype', 'select', 'Order Type',
	'customrecord_wmsse_ordertype').setDisplaySize(150);
	if(request.getParameter('custpage_qbordertype')!='' && 
			request.getParameter('custpage_qbordertype')!=null)
	{
		OrderType.setDefaultValue(request.getParameter('custpage_qbordertype'));	
	}

	var VItem = form.addField('custpage_qbitem', 'select', 'Item');
	VItem.addSelectOption("","");
	var subArr = new Array();
	subArr = getRoleBasedSubsidiaries();
	nlapiLogExecution('ERROR','subArr',subArr);

	var filterArr = new Array();
	
	if(subArr != '' && subArr != null && subArr != 'null')
	filterArr.push(new nlobjSearchFilter('subsidiary', null, 'anyof', subArr));

	var results = nlapiSearchRecord('item',
			'customsearch_wmsse_validitem_name_srh', filterArr, null);
	nlapiLogExecution('ERROR', 'results',results);
	if(results != null && results != '')
	{
		nlapiLogExecution('ERROR', 'results.length',results.length);
		for(var i=0;i<results.length;i++)
		{
			var iName = results[i].getValue('name');
			var itemId = results[i].getValue('internalid');
			VItem.addSelectOption(itemId,iName);
		}
	}
	if(request.getParameter('custpage_qbitem')!='' && request.getParameter('custpage_qbitem')!=null)
	{
		VItem.setDefaultValue(request.getParameter('custpage_qbitem'));	
	}

	var customer = form.addField('custpage_qbcustomer', 'select', 'Customer','customer');
	if(request.getParameter('custpage_qbcustomer')!='' && 
			request.getParameter('custpage_qbcustomer')!=null)
	{
		customer.setDefaultValue(request.getParameter('custpage_qbcustomer'));
	}

	var shipDate = form.addField('custpage_qbshipdate', 'date', 'Ship Date');
	//shipDate.setDisplaySize(200);
	if(request.getParameter('custpage_qbshipdate')!='' && 
			request.getParameter('custpage_qbshipdate')!=null)
	{
		shipDate.setDefaultValue(request.getParameter('custpage_qbshipdate'));
	}

	var ShipMethod = form.addField('custpage_qbshipmethod', 'select', 'Ship Method');
	ShipMethod.addSelectOption("","");
	if(request.getParameter('custpage_qbshipmethod')!='' && 
			request.getParameter('custpage_qbshipmethod')!=null)
	{
		ShipMethod.setDefaultValue(request.getParameter('custpage_qbshipmethod'));	
	}
	var shipmethodResults = getShipmethods(null);
	nlapiLogExecution('ERROR', 'shipmethodResults', shipmethodResults);
	if(shipmethodResults != null && shipmethodResults != '' && shipmethodResults != 'null')
	{
		for (var j = 0; shipmethodResults != null && j < shipmethodResults.length; j++) {
			if(shipmethodResults[j].getValue('custrecord_wmsse_carrier_nsmethod',null, 
			'group') != null && shipmethodResults[j].getValue(
					'custrecord_wmsse_carrier_nsmethod',null, 'group') != "" && 
					shipmethodResults[j].getValue('custrecord_wmsse_carrier_nsmethod',null,
					'group') != " ")
			{
				var tshipmethod = form.getField('custpage_qbshipmethod').getSelectOptions(
						shipmethodResults[j].getValue('custrecord_wmsse_carrier_nsmethod',null, 
						'group'), 'is');
				if (tshipmethod != null) {
					if (tshipmethod.length > 0) {
						continue;
					}
				}
				ShipMethod.addSelectOption(shipmethodResults[j].getValue(
						'custrecord_wmsse_carrier_nsmethod',null, 'group'),
						shipmethodResults[j].getText('custrecord_wmsse_carrier_nsmethod',null,
						'group'));
			}
		}
	}

	var vTaskAssignTo = form.addField('custpage_qbemployee', 'select', 'Task Assigned To','employee');
	if(request.getParameter('custpage_qbemployee')!='' &&
			request.getParameter('custpage_qbemployee')!=null)
	{
		vTaskAssignTo.setDefaultValue(request.getParameter('custpage_qbemployee'));
	}

	form.addSubmitButton('Display');
}

/**
 * This function is to retrieve Transaction Internal id with Order name
 * 
 */
function getSOId(sonumber,tranType)
{
	var vType='SalesOrd';
	if(tranType=='salesorder')
		vType='SalesOrd';
	else if(tranType=='transferorder')
		vType='TrnfrOrd';

	var soId = '';
	var SODetails=new Array();
	var transactionsearchresult = new nlapiLoadSearch('transaction', 'customsearch_wmsse_transactiondetail_srh');
	if(sonumber != null && sonumber != '' && sonumber != 'null')
		transactionsearchresult.addFilter(new nlobjSearchFilter('tranid', null, 'is', sonumber));
	transactionsearchresult.addFilter(new nlobjSearchFilter('type', null, 'anyof', vType));
	var resLenDetails = transactionsearchresult.runSearch();
	
	
	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) 
	{
		SODetails = SODetails.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}
	
	nlapiLogExecution('ERROR', 'SODetails', SODetails);
	if(SODetails != null && SODetails != '')
	{
		soId = SODetails[0].getValue('internalid');
	}

	return soId;
}


/**
 * This function is to return Role based subsidiaries 
 * 
 */
function getRoleBasedSubsidiaries()
{
	var totSubArr = new Array();
	var subs = nlapiGetContext().getFeature('subsidiaries');
	nlapiLogExecution('ERROR', 'subs', subs);
	nlapiLogExecution('ERROR', 'test', 'test');
	if(subs != null && subs != '' && subs==true)
	{
		var vRoleLocation=new Array();
		var context=nlapiGetContext();
		var vSubsid=context.getSubsidiary();
		nlapiLogExecution('ERROR', 'vSubsid', vSubsid);
		var vRoleid=context.getRole();
		nlapiLogExecution('Debug', 'vRoleid', vRoleid);
		var vRoleSubsidArray=new Array();
		if(vRoleid !=null && vRoleid !='')
		{
			var vRolefilters=new Array();

			if(vRoleid != null && vRoleid != '')
				vRolefilters.push(new nlobjSearchFilter('internalid', null, 'anyof', vRoleid));
			vRolefilters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F')); 
			var vRoleColumns=new Array();
			vRoleColumns.push(new nlobjSearchColumn('name'));
			vRoleColumns.push(new nlobjSearchColumn('subsidiaries'));
			var vRolesearchresults = nlapiSearchRecord('Role', null, vRolefilters, vRoleColumns);
			if(vRolesearchresults !=null && vRolesearchresults !='' && vRolesearchresults.length > 0)
			{
				for(var i=0;i<vRolesearchresults.length;i++)
				{
					var vnRoleSubsid=vRolesearchresults[i].getValue('subsidiaries');
					vRoleSubsidArray.push(vnRoleSubsid);
				}
			}
		}
		nlapiLogExecution('Debug', 'vRoleSubsidArray', vRoleSubsidArray);
		if(vRoleSubsidArray != null && vRoleSubsidArray != '' && vRoleSubsidArray.length>0)
		{
			totSubArr = vRoleSubsidArray;
		}
		else
		{
			totSubArr.push(vSubsid);
		}
		nlapiLogExecution('ERROR', 'totSubArr', totSubArr);
	}
	return totSubArr;
}