/**
 * Script Description
 * This script displays the pick report with suggested bin locations for selected order.
 */
/***************************************************************************
  Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved. 
 ***************************************************************************/

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function fnPickReport(request, response){
	if (request.getMethod() == 'GET') {
		var form = nlapiCreateForm('Pick Report');
		createform(form);
		form.addSubmitButton('Display');
		response.writePage(form);

	}
	else
	{
		var form = nlapiCreateForm('Pick Report');

		var vQbOrdNo = request.getParameter('custpage_qbso');
		var vQbTranType = request.getParameter('custpage_trantype');
		var vQbLocation = request.getParameter('custpage_whlocation');
		var vQbCustomer = request.getParameter('custpage_qbcustomer');
		var vQbShipDate = request.getParameter('custpage_qbshipdate');
		var vReprint = request.getParameter('custpage_reprint');
		var vnoofLines = request.getParameter('custpage_nooflines');
		var vQty = request.getParameter('custpage_qty');
		var vshipcomplete = request.getParameter('custpage_shipcomplete');
		var vQbOrderType = request.getParameter('custpage_ordertype');
		var vQbdepartment = request.getParameter('custpage_dept');
		var vQbClass = request.getParameter('custpage_class');
		var vQbshipmethod = request.getParameter('custpage_shipmethod');
		var vQbitemfamily = request.getParameter('custpage_itemfamily');
		var vQbitemgroup = request.getParameter('custpage_itemgroup');
		
		
		if(vReprint==null || vReprint == 'null' || vReprint == 'undefined' || vReprint=='')
		{
			vReprint='F';
		}
		var vLocname= nlapiLookupField('location',request.getParameter('custpage_whlocation'),'name');
		nlapiLogExecution('DEBUG', 'vLocname', vLocname);
		nlapiLogExecution('ERROR', 'vQbOrdNo', vQbOrdNo); 
		nlapiLogExecution('ERROR', 'vQbCustomer', vQbCustomer); 
		nlapiLogExecution('ERROR', 'vQbShipDate', vQbShipDate); 
		nlapiLogExecution('ERROR', 'vQbTranType', vQbTranType); 
		nlapiLogExecution('ERROR', 'vReprint', vReprint); 
		nlapiLogExecution('ERROR', 'vshipcomplete', vshipcomplete); 
		nlapiLogExecution('ERROR', 'vQty', vQty); 
		nlapiLogExecution('ERROR', 'vnoofLines', vnoofLines); 
		nlapiLogExecution('ERROR', 'vQbdepartment', vQbdepartment); 
		nlapiLogExecution('ERROR', 'vQbClass', vQbClass); 
		 
		var arrSodetails = null;
		var Sodetails = null;
		if((vQbOrdNo != null && vQbOrdNo != "" ) || (vQbTranType != null && vQbTranType != ''))
		{
			//fetch the wave number
			arrSodetails = getSOLineDetailsforpickreports(vQbOrdNo,null,vQbTranType,vQbCustomer,vQbShipDate,vReprint,vQty,vnoofLines,vshipcomplete,vQbLocation,vQbOrderType,vQbdepartment,vQbClass,vQbshipmethod,vQbitemfamily,vQbitemgroup);
		}
		if(arrSodetails!=null && arrSodetails!='' && arrSodetails.length>0)
		{
			Sodetails = setPagingForSublist(form,arrSodetails,vshipcomplete,vReprint);
		}
		if(Sodetails!=null && Sodetails!='' && Sodetails.length>0)
		{
			
			form.setScript('customscript_wmsse_sngordpickreport_cl');

			form.addButton('custpage_print','Print','Printreport()');
			createform(form);
			form.addSubmitButton('Display');
			var sublist = form.addSubList("custpage_items", "list", "Order List");

			sublist.addField("custpage_select", "checkbox", "Confirm").setDefaultValue('F');
			sublist.addField("custpage_sono", "text", "Transaction #"); 
			sublist.addField("custpage_whloc", "text", "Location"); 
			if(vQbTranType != 'transferorder')
			{
				sublist.addField("custpage_customer", "text", "Customer");
			}

			sublist.addField("custpage_shipdate", "date", "Ship Date"); 
			sublist.addField("custpage_department", "text", "Department"); 
			sublist.addField("custpage_classs", "text", "Class"); 
			sublist.addField("custpage_shpmethod", "text", "Ship Method"); 
			sublist.addField("custpage_sointernalid", "text", "So InternalId").setDisplayType('hidden'); 
			sublist.addMarkAllButtons();

			var p=1;
			var soIdArray=new Array();
			var vColumnslist=arrSodetails[0].getAllColumns();


			var custIndex = 12;
			var commitedQtyIndex = 25;
			var fulfilledQtyIndex = 26;
			var conversionRateIndex=27;
			var totalPickedQtyIndex =7;
			var totalNSPickedQtyIndex =37;
			var ERPConfirmedQty =38;
			var pickgeneratedQtyIndx = 41;
			for(var x1=0;x1<vColumnslist.length;x1++)
			{
				var summaryLabel = vColumnslist[x1].getLabel();
				var name  = vColumnslist[x1].getName();
				if(summaryLabel == 'Customer Id')
				{
					custIndex = x1;
				}
				else if (summaryLabel == 'Committed Quantity')
				{
					commitedQtyIndex = x1;
				}
				else if (summaryLabel == 'Fulfilled Quantity' && name == 'formulanumeric')
				{
					fulfilledQtyIndex = x1;
				}
				else if (summaryLabel == 'Conversion Rate')
				{
					conversionRateIndex = x1;
				}
				else if (summaryLabel == 'Total Picked Quantity')
				{
					totalPickedQtyIndex = x1;
				}
				else if(name == 'quantityuom')
				{
					quantityuomIndex = x1;
				}
				else if (summaryLabel == 'ERPpickedQuantity')
				{
					totalNSPickedQtyIndex = x1;
				}
				else if (summaryLabel == 'ERP CONFIRMED QTY')
				{
					ERPConfirmedQty = x1;
				}
				else if (summaryLabel == 'pickgenerated Quantity')
				{
					pickgeneratedQtyIndx = x1;
				}
				else
				{

				}
			}

			var minval=0;var maxval=parseFloat(Sodetails.length);

			var selectno=request.getParameter('custpage_selectpage');
			nlapiLogExecution('Error','selectno', selectno);
			if(selectno!=null && selectno!='null'  && selectno!=undefined && selectno!= '' && Sodetails.length > 10)
			{
				var selectedPage= request.getParameter('custpage_selectpage');
				var selectedPageArray=selectedPage.split(',');	

				minval = parseFloat(selectedPageArray[0])-1;

				if(parseFloat(Sodetails.length) >= parseFloat(selectedPageArray[1]))
				{
					maxval=parseFloat(selectedPageArray[1])-1;
				}


			}
			else
			{
				if(Sodetails.length > 10)
				{
					maxval = 9;
				}
			}

			for(var k=minval;k<=maxval;k++)
			{
				if(Sodetails[k] != null  && Sodetails[k] != '' && Sodetails[k] != 'null' && Sodetails[k] != 'undefined')
				{


					var vSORecord=Sodetails[k];

					if(soIdArray.indexOf(vSORecord.getValue('tranid',null,'group'))==-1)
					{	

						var vsoitemQty=vSORecord.getValue(vColumnslist[commitedQtyIndex]);			 
						var vsoitemfulfillQty=vSORecord.getValue(vColumnslist[fulfilledQtyIndex]);
						var vsoitemopentaskQty=vSORecord.getValue(vColumnslist[totalPickedQtyIndex]);
						var vsoitemErpConfirmedQty=vSORecord.getValue(vColumnslist[ERPConfirmedQty]);
						var vsoitemNSReceivedQty=vSORecord.getValue(vColumnslist[totalNSPickedQtyIndex]);
						if(vsoitemopentaskQty==null || vsoitemopentaskQty=='' ||vsoitemopentaskQty=='null' || vsoitemopentaskQty=='undefined' )
						{
							vsoitemopentaskQty = 0;
						}
						if(vsoitemErpConfirmedQty ==null || vsoitemErpConfirmedQty=='' ||vsoitemErpConfirmedQty=='null' || vsoitemErpConfirmedQty=='undefined' )
						{
							vsoitemErpConfirmedQty = 0;
						}
						if(vsoitemNSReceivedQty ==null || vsoitemNSReceivedQty=='' ||vsoitemNSReceivedQty=='null' || vsoitemNSReceivedQty=='undefined' )
						{
							vsoitemNSReceivedQty = 0;
						}

													
						vsoitemopentaskQty=new Big(vsoitemopentaskQty);
						vsoitemErpConfirmedQty=new Big(vsoitemErpConfirmedQty);
						vsoitemNSReceivedQty=new Big(vsoitemNSReceivedQty);
						var vsoitemRcvQty = Number(vsoitemopentaskQty.plus(vsoitemErpConfirmedQty).plus((vsoitemNSReceivedQty.minus(vsoitemErpConfirmedQty))));
						nlapiLogExecution('DEBUG', 'vsoitemRcvQty', vsoitemRcvQty);


						if(vsoitemRcvQty==null || vsoitemRcvQty=='')
							vsoitemRcvQty=0;
						if(vsoitemfulfillQty==null || vsoitemfulfillQty=='')
							vsoitemfulfillQty=0;
						if(vsoitemQty==null || vsoitemQty=='')
							vsoitemQty=0;
													
						vsoitemQty=new Big(vsoitemQty);
						vsoitemfulfillQty=new Big(vsoitemfulfillQty);
						
						var vSoreminqty = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus(vsoitemRcvQty));
						nlapiLogExecution('DEBUG', 'vSoreminqty', vSoreminqty);
						
													
						if(parseFloat(vSoreminqty) > 0)
						{	

							form.getSubList('custpage_items').setLineItemValue('custpage_sono', p, vSORecord.getValue('tranid',null,'group'));
							form.getSubList('custpage_items').setLineItemValue('custpage_whloc', p, vLocname);
							if(vQbTranType != 'transferorder')
							{
								if(vSORecord.getValue('entityid','customer','group')!=null && vSORecord.getValue('entityid','customer','group')!='')
								{
									form.getSubList('custpage_items').setLineItemValue('custpage_customer', p, vSORecord.getValue('entityid','customer','group'));
								}
								else
								{									
									var filtersExp = new Array();
									var cols = new Array();
									cols.push(new nlobjSearchColumn('entity'));
									filtersExp.push(new nlobjSearchFilter('internalid', null, 'anyof', vSORecord.getValue('internalid',null,'group')));	
									var vCustomer = nlapiSearchRecord(vQbTranType,null,filtersExp,cols);

									if(vCustomer != null && vCustomer != '' && vCustomer != 'null' && vCustomer != 'undefined')
									{

										form.getSubList('custpage_items').setLineItemValue('custpage_customer', p, vCustomer[0].getText('entity'));
									}
									else
										form.getSubList('custpage_items').setLineItemValue('custpage_customer', p, vSORecord.getValue('altname','customer','group'));	


									//form.getSubList('custpage_items').setLineItemValue('custpage_customer', p, vSORecord.getValue('altname','customer','group'));
								}
							}
							form.getSubList('custpage_items').setLineItemValue('custpage_shipdate', p, vSORecord.getValue('shipdate',null,'group'));
							form.getSubList('custpage_items').setLineItemValue('custpage_sointernalid', p, vSORecord.getValue('internalid',null,'group'));
							form.getSubList('custpage_items').setLineItemValue('custpage_department', p, vSORecord.getText('department',null,'group'));
							form.getSubList('custpage_items').setLineItemValue('custpage_classs', p, vSORecord.getText('class',null,'group'));
							form.getSubList('custpage_items').setLineItemValue('custpage_shpmethod', p, vSORecord.getText('shipmethod',null,'group'));

							p=parseInt(p)+1;
							soIdArray.push(vSORecord.getValue('tranid',null,'group'));
						}
					}
				}
			}				
			arrSodetails=null;	
			soIdArray=null;
		}
		else
		{
			createform(form);
			var msg = form.addField('custpage_message', 'inlinehtml', null, null, null);
			msg.setLayoutType('outside','startcol');

			if(vQbOrdNo == '' || vQbOrdNo == null || vQbOrdNo == 'null')
			{
				msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Error', 'No transactions match your search criteria.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
			}
			else
			{

				if(vQbTranType == 'transferorder')
					msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Error', 'Enter a valid transfer order number.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
				else
					msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Error', 'Enter a valid sales order number.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");

			}
			form.addSubmitButton('Display');


		}	

		response.writePage(form);

	}	
}

function createform(form)
{

	var soField = form.addField('custpage_qbso', 'text', 'Transaction #');
	var vSo = request.getParameter('custpage_qbso');

	soField.setDefaultValue(vSo); 
	var whLocation = form.addField('custpage_whlocation', 'select', 'Location').setMandatory(true);

	whLocation.addSelectOption("","");

	var vRolebasedLocation = getRoledBasedLocation();


	if(vRolebasedLocation==null || vRolebasedLocation=='' || vRolebasedLocation==0)
	{
		vRolebasedLocation = new Array();
		var filters=new Array();
		filters.push(new nlobjSearchFilter('custrecord_wmsse_make_wh_site', null, 'is', 'T'));
		filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F')); 
		var searchresults = nlapiSearchRecord('location', null, filters, null);
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
				var tslocation = form.getField('custpage_whlocation').getSelectOptions(roleBasedLocationArray[j][0], 'is');
				if (tslocation != null) {
					if (tslocation.length > 0) {
						continue;
					}
				}
				whLocation.addSelectOption(roleBasedLocationArray[j][0], roleBasedLocationArray[j][1]);
			}
		}
	}
	if(request.getParameter('custpage_whlocation')!='' && request.getParameter('custpage_whlocation')!=null)
	{
		whLocation.setDefaultValue(request.getParameter('custpage_whlocation'));	
	}
	//Setting location value as default if the subsidiary have only one location.
	if(vRolebasedLocation.length==1)
	{
		whLocation.setDefaultValue(vRolebasedLocation[0]);	
	}

	var TranType = form.addField('custpage_trantype', 'select', 'Transaction Type').setMandatory(true).setDisplaySize(150);

	TranType.addSelectOption("salesorder","Sales Order");
	TranType.addSelectOption("transferorder","Transfer Order");
	if(request.getParameter('custpage_trantype')!='' && request.getParameter('custpage_trantype')!=null)
	{
		TranType.setDefaultValue(request.getParameter('custpage_trantype'));	
	}
	var OrderType = form.addField('custpage_ordertype', 'select', 'Order Type','customrecord_wmsse_ordertype').setDisplaySize(150);
	if(request.getParameter('custpage_ordertype')!='' && request.getParameter('custpage_ordertype')!=null)
	{
		OrderType.setDefaultValue(request.getParameter('custpage_ordertype'));	
	}
	var department = form.addField('custpage_dept', 'select', 'Department','department').setDisplaySize(150);
	if(request.getParameter('custpage_dept')!='' && request.getParameter('custpage_dept')!=null)
	{
		department.setDefaultValue(request.getParameter('custpage_dept'));	
	}
	var vclass = form.addField('custpage_class', 'select', 'Class','classification').setDisplaySize(150);
	if(request.getParameter('custpage_class')!='' && request.getParameter('custpage_class')!=null)
	{
		vclass.setDefaultValue(request.getParameter('custpage_class'));	
	}
	var nooflines = form.addField('custpage_nooflines', 'text', '# Of Lines');
	if(request.getParameter('custpage_nooflines')!='' && request.getParameter('custpage_nooflines')!=null)
	{
		nooflines.setDefaultValue(request.getParameter('custpage_nooflines'));
	}

	var qty = form.addField('custpage_qty', 'text', 'Qty');
	if(request.getParameter('custpage_qty')!='' && request.getParameter('custpage_qty')!=null)
	{
		qty.setDefaultValue(request.getParameter('custpage_qty'));
	}
	var customer = form.addField('custpage_qbcustomer', 'select', 'Customer','customer');//.setMandatory(true);
	var shipDate = form.addField('custpage_qbshipdate', 'date', 'Ship Date');//.setMandatory(true);
	var vTaskAssignTo = form.addField('custpage_qbemployee', 'select', 'Task Assigned To','employee');//.setMandatory(true);
	if(request.getParameter('custpage_qbcustomer')!='' && request.getParameter('custpage_qbcustomer')!=null)
	{
		customer.setDefaultValue(request.getParameter('custpage_qbcustomer'));
	}
	if(request.getParameter('custpage_qbshipdate')!='' && request.getParameter('custpage_qbshipdate')!=null)
	{
		shipDate.setDefaultValue(request.getParameter('custpage_qbshipdate'));
	}
	if(request.getParameter('custpage_qbemployee')!='' && request.getParameter('custpage_qbemployee')!=null)
	{
		vTaskAssignTo.setDefaultValue(request.getParameter('custpage_qbemployee'));
	}
	var rePrint = form.addField('custpage_reprint', 'checkbox', 'ALLOW REPRINTING');
	if(request.getParameter('custpage_reprint')!='' && request.getParameter('custpage_reprint')!=null)
	{
		rePrint.setDefaultValue(request.getParameter('custpage_reprint'));
	}

	var shipcomplete = form.addField('custpage_shipcomplete', 'checkbox', 'Ship Complete');
	if(request.getParameter('custpage_shipcomplete')!='' && request.getParameter('custpage_shipcomplete')!=null)
	{
		shipcomplete.setDefaultValue(request.getParameter('custpage_shipcomplete'));
	}

	var ShipMethod = form.addField('custpage_shipmethod', 'select', 'Ship Method');
	ShipMethod.addSelectOption("","");
	if(request.getParameter('custpage_shipmethod')!='' && request.getParameter('custpage_shipmethod')!=null)
	{
		ShipMethod.setDefaultValue(request.getParameter('custpage_shipmethod'));	
	}
	var shipmethodResults = getShipmethods(null);
	nlapiLogExecution('ERROR', 'shipmethodResults', shipmethodResults);
	if(shipmethodResults != null && shipmethodResults != '' && shipmethodResults != 'null')
	{
		for (var j = 0; shipmethodResults != null && j < shipmethodResults.length; j++) {
			if(shipmethodResults[j].getValue('custrecord_wmsse_carrier_nsmethod',null, 'group') != null && shipmethodResults[j].getValue('custrecord_wmsse_carrier_nsmethod',null, 'group') != "" && shipmethodResults[j].getValue('custrecord_wmsse_carrier_nsmethod',null, 'group') != " ")
			{
				var tshipmethod = form.getField('custpage_shipmethod').getSelectOptions(shipmethodResults[j].getValue('custrecord_wmsse_carrier_nsmethod',null, 'group'), 'is');
				if (tshipmethod != null) {
					if (tshipmethod.length > 0) {
						continue;
					}
				}
				ShipMethod.addSelectOption(shipmethodResults[j].getValue('custrecord_wmsse_carrier_nsmethod',null, 'group'), shipmethodResults[j].getText('custrecord_wmsse_carrier_nsmethod',null, 'group'));
			}
		}
	}
	var ItemFamily = form.addField('custpage_itemfamily', 'select', 'Item Family','customrecord_wmsse_item_family');//
	if(request.getParameter('custpage_itemfamily')!='' && request.getParameter('custpage_itemfamily')!=null)
	{
		ItemFamily.setDefaultValue(request.getParameter('custpage_itemfamily'));	
	}
	var ItemGroup = form.addField('custpage_itemgroup', 'select', 'Item Group','customrecord_wmsse_itemgroup');
	if(request.getParameter('custpage_itemgroup')!='' && request.getParameter('custpage_itemgroup')!=null)
	{
		ItemGroup.setDefaultValue(request.getParameter('custpage_itemgroup'));	
	}

}

function Printreport(){
	var vSo = nlapiGetFieldValue('custpage_qbso');
	var vTranType = nlapiGetFieldValue('custpage_trantype');
	var vCustomer='';
	if(vTranType != 'transferorder')
		vCustomer = nlapiGetFieldValue('custpage_qbcustomer');
	var vShipDate = nlapiGetFieldValue('custpage_qbshipdate');

	var vEmployee = nlapiGetFieldValue('custpage_qbemployee');
	var vnoofLines = nlapiGetFieldValue('custpage_nooflines');
	var vQty = nlapiGetFieldValue('custpage_qty');
	var vshipcomplete = nlapiGetFieldValue('custpage_shipcomplete');
	var whLocation = nlapiGetFieldValue('custpage_whlocation');
	var lincount = nlapiGetLineItemCount('custpage_items');
	var orderType = nlapiGetFieldValue('custpage_ordertype');
	var vrePrint = nlapiGetFieldValue('custpage_reprint');
	var vQbdepartment = nlapiGetFieldValue('custpage_dept');
	var vQbClass = nlapiGetFieldValue('custpage_class');
	var vQbshipmethod = nlapiGetFieldValue('custpage_shipmethod');
	var vQbitemfamily = nlapiGetFieldValue('custpage_itemfamily');
	var vQbitemgroup = nlapiGetFieldValue('custpage_itemgroup');

	var orderNum=new Array;
	var selectedFlag='F';
	var ordStr = '';
	var unprintedArray = new Array();
	var printedArray = new Array();
	for (var p = 1; p <= lincount ; p++) 
	{
		var lineSelected = nlapiGetLineItemValue('custpage_items', 'custpage_select', p);
		if(lineSelected=='T')
		{
			var vOrd = nlapiGetLineItemValue('custpage_items', 'custpage_sono', p);
			var vOrdInternalId = nlapiGetLineItemValue('custpage_items', 'custpage_sointernalid', p);

			var vAlreadyPickedDetails=fnGetPickReportDetails(vOrdInternalId,whLocation);
			var replaceChar =/\$|,|@|#|~|`|\%|\*|\^|\+|\=|\-|\_|\[|\}|\{|\;|\:|\<|\>|\?|\||\\|\!|\$|\./g;
			if((vAlreadyPickedDetails == null || vAlreadyPickedDetails == '' || vAlreadyPickedDetails =='null') && vrePrint == "T")
			{
				var lineNo = p;
				var str = vOrd+":"+lineNo;
				unprintedArray.push(str);
				selectedFlag='F';

			}
//			else if((vAlreadyPickedDetails != null && vAlreadyPickedDetails != '' && vAlreadyPickedDetails !='null') && vrePrint == "F")
//			{				
//				var lineNo = p;
//				var str = vOrd+":"+lineNo;
//				printedArray.push(str);
//				selectedFlag='F';
//
//			}
			else
			{

				
				vOrd=vOrd.replace(replaceChar,'');
				if(ordStr == '')
				{
					ordStr = vOrd;
				}
				else
				{
					ordStr = ordStr + ","+vOrd;
				}

				orderNum.push(vOrdInternalId);
				selectedFlag='T';
			}
		}
	}
	if(unprintedArray.length > 0)
	{
		var ordStr = '';
		var lineArray = new Array();
		for (var k=0;k<unprintedArray.length;k++)
		{
			var tStr = unprintedArray[k].split(':');
			var tOrd = tStr[0];
			var tline = tStr[1];
						
			tOrd=tOrd.replace(replaceChar,'');
				
				if(k==0)
				{
					ordStr = tOrd;
				}
				else
				{
					ordStr = ordStr+","+tOrd;
				}
				lineArray.push(tline);
			
		}

		alert('Pick reports for the following selected orders have not yet been generated:'+ordStr+'.');
		selectedFlag = 'T';
		for(var k1=0;k1<=lineArray.length;k1++)
		{
			var line = lineArray[k1];
			nlapiSetLineItemValue('custpage_items', 'custpage_select', line,'F');
		}


		return false;
	}
	
	if(selectedFlag == 'F')
	{
		alert('Please select atleast one order#');
		return false;
	}
	var PDFURL = nlapiResolveURL('SUITELET', 'customscript_wmsse_pickreportpdf', 'customdeploy_wmsse_pickreportpdf');
	var ruleDet = screenURL('PICKREPORT');

	if(ruleDet!=null && ruleDet!='')
	{
		var vScreenType = ruleDet[0].getValue('custrecord_wmsserulevalue');
		var vScriptId = ruleDet[0].getValue('custrecord_wmsse_scriptid');
		var vDeployId = ruleDet[0].getValue('custrecord_wmsse_deployid');
		if(vScreenType=='CUSTOM' && (vScriptId!=null && vScriptId!='' && vScriptId!='null' && vDeployId!=null && vDeployId!='' && vDeployId!='null'))
		{
			nlapiLogExecution('ERROR', 'vScriptId', vScriptId);
			nlapiLogExecution('ERROR', 'vDeployId', vDeployId);
			PDFURL = nlapiResolveURL('SUITELET',vScriptId, vDeployId);
		}

	}
	nlapiLogExecution('ERROR', 'PDF URL',PDFURL);	
	PDFURL = PDFURL+'&custparam_qbitemgroup='+ vQbitemgroup+'&custparam_qbitemfamily='+ vQbitemfamily+'&custparam_qbclass='+ vQbClass+'&custparam_qbdepartment='+ vQbdepartment+'&custparam_tranid_lst='+ ordStr+'&custparam_order_no='+ orderNum+'&custparam_ordertype='+orderType+'&custparam_trantype='+vTranType+'&custparam_customer='+vCustomer+'&custparam_shipdate='+vShipDate+'&custparam_taskassignedto='+vEmployee+'&custpage_nooflines='+vnoofLines+'&custpage_qty='+vQty+'&custpage_shipcomplete='+vshipcomplete+'&custparam_whlocation='+whLocation+'&custparam_reprint='+vrePrint;
	nlapiLogExecution('ERROR', 'PDF URL1',PDFURL);
	window.open(PDFURL);

}
function screenURL(vScreen)
{
	var filters = new Array();
	var columns = new Array();
	filters.push(new nlobjSearchFilter('name', null, 'is', vScreen));	
	filters.push(new nlobjSearchFilter('isinactive',null, 'is','F'));	

	columns[0] = new nlobjSearchColumn('custrecord_wmsserulevalue');
	columns[1] = new nlobjSearchColumn('custrecord_wmsse_scriptid');
	columns[2] = new nlobjSearchColumn('custrecord_wmsse_deployid');

	var ruleDetails = nlapiSearchRecord('customrecord_wmsse_sysrules', null, filters, columns);

	return ruleDetails;

}
/**
 * 
 * @param SOIntId
 * @param WHLocation
 */
function fnGetPickCompletedDetails(SOIntId,WHLocation)
{
	var filters=new Array();
	if(SOIntId != null && SOIntId != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', SOIntId));

	if(WHLocation != null && WHLocation != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', WHLocation));

	filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof',3));
	filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [28,8]));


	var objPickSearchResults = new nlapiSearchRecord('customrecord_wmsse_trn_opentask', null, filters, null);
	nlapiLogExecution('ERROR', 'objPickSearchResults',objPickSearchResults);
	return objPickSearchResults;
}

/**
 * 
 * @param SOIntId
 * @param WHLocation
 */
function fnGetPickReportDetails(SOIntId,WHLocation)
{
	var filters=new Array();
	var objPickSearchvalues=new Array()
	var objPickreportResults = nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_pickreportdetails');
	if(SOIntId != null && SOIntId != '')
		objPickreportResults.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', SOIntId));

	if(WHLocation != null && WHLocation != '')
		objPickreportResults.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', WHLocation));

     var resLenDetails = objPickreportResults.runSearch();					
	
	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) 
	{
		objPickSearchvalues = objPickSearchvalues.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}

	
	return objPickSearchvalues;
}
/**
 * 
 * @param SOIntId
 */

function setPagingForSublist(form,orderList,vshipcomplete,vReprint)
{
	var orderListArray=new Array();	
	var orderidArray=new Array();	
	var ctx = nlapiGetContext();
	var SOSearchResults = new Array();
	if(orderList != null && orderList.length > 0){
		var vColumnslist=orderList[0].getAllColumns();
		if(vshipcomplete != null && vshipcomplete != '' && vshipcomplete != 'null' && vshipcomplete != 'undefined' && vshipcomplete =='T' )
		{
			for(var sorder=0;sorder<orderList.length;sorder++)
			{

				var soresult = orderList[sorder];
				var tranType=  soresult.getValue('type',null,'group');

				var type= '';
				if(tranType == 'SalesOrd')
				{
					type = 'salesorder';
				}
				else
				{
					type = 'transferorder';
				}
				var SOinternalid=  soresult.getValue('internalid',null,'group');

				orderidArray.push(SOinternalid);
				

			}
			orderidArray = removeDuplicateElement(orderidArray);
			nlapiLogExecution('Error','orderidArray', orderidArray);
			var filters = new Array();
			var transactionSearchResults = nlapiLoadSearch(type, 'customsearch_wmsse_transactiondetail_srh');
			transactionSearchResults.addFilter(new nlobjSearchFilter('mainline', null, 'is', 'F'));
			if(orderidArray!=null && orderidArray!='')
				transactionSearchResults.addFilter(new nlobjSearchFilter('internalid', null, 'anyof', orderidArray));
			transactionSearchResults.addFilter(new nlobjSearchFilter('quantity', null, 'greaterthan', 0));
			transactionSearchResults.addFilter(new nlobjSearchFilter('shipping', null, 'is', 'F'));
			transactionSearchResults.addFilter(new nlobjSearchFilter('taxline', null, 'is', 'F'));
			if(vshipcomplete!=null && vshipcomplete!='' && vshipcomplete!='undefined' && vshipcomplete!='')
				transactionSearchResults.addFilter(new nlobjSearchFilter('shipcomplete', null, 'is', vshipcomplete));



			var resLenDetails = transactionSearchResults.runSearch();					

			var resultsPage = resLenDetails.getResults(0, 1000);
			var offset = 0;
			while (!!resultsPage && resultsPage.length > 0) 
			{
				SOSearchResults = SOSearchResults.concat(resultsPage);
				offset += 1000;
				resultsPage = resLenDetails.getResults(offset, offset + 1000);
			}
		}
		nlapiLogExecution('Error','SOSearchResults', SOSearchResults);
		var custIndex = 12;
		var commitedQtyIndex = 25;
		var fulfilledQtyIndex = 26;
		var conversionRateIndex=27;
		var totalPickedQtyIndex =7;
		var totalNSPickedQtyIndex =37;
		var ERPConfirmedQty =38;
		var pickgeneratedQtyIndx = 41;
		for(var x1=0;x1<vColumnslist.length;x1++)
		{
			var summaryLabel = vColumnslist[x1].getLabel();
			var name =  vColumnslist[x1].getName();
			if(summaryLabel == 'Customer Id')
			{
				custIndex = x1;
			}
			else if (summaryLabel == 'Committed Quantity')
			{
				commitedQtyIndex = x1;
			}
			else if (summaryLabel == 'Fulfilled Quantity' && name == 'formulanumeric')
			{
				fulfilledQtyIndex = x1;
			}
			else if (summaryLabel == 'Conversion Rate')
			{
				conversionRateIndex = x1;
			}
			else if (summaryLabel == 'Total Picked Quantity')
			{
				totalPickedQtyIndex = x1;
			}
			else if (summaryLabel == 'ERPpickedQuantity')
			{
				totalNSPickedQtyIndex = x1;
			}
			else if (summaryLabel == 'ERP CONFIRMED QTY')
			{
				ERPConfirmedQty = x1;
			}
			else if (summaryLabel == 'pickgenerated Quantity')
			{
				pickgeneratedQtyIndx = x1;
			}
			else
			{

			}
		}
		
		var orderListArrayFltr = new Array();
		var backordList = new Array();
		nlapiLogExecution('Error','orderList.length', orderList.length);
		for(k=0;k<orderList.length;k++)
		{
			var ordsearchresult = orderList[k];
			if(ordsearchresult!=null)
			{
				var backOrderFlag = false;

				if(orderListArrayFltr.indexOf(ordsearchresult.getValue('tranid',null,'group'))==-1 && backordList.indexOf(ordsearchresult.getValue('tranid',null,'group'))==-1)
				{

					var vsoitemQty=ordsearchresult.getValue(vColumnslist[commitedQtyIndex]);			 
					var vsoitemfulfillQty=ordsearchresult.getValue(vColumnslist[fulfilledQtyIndex]);
					var vsoitemopentaskQty=ordsearchresult.getValue(vColumnslist[totalPickedQtyIndex]);
					var vsoitemErpConfirmedQty=ordsearchresult.getValue(vColumnslist[ERPConfirmedQty]);
					var vsoitemNSReceivedQty=ordsearchresult.getValue(vColumnslist[totalNSPickedQtyIndex]);
					var vsolinepickgeneratedQty=ordsearchresult.getValue(vColumnslist[pickgeneratedQtyIndx]);
					if(vsoitemopentaskQty==null || vsoitemopentaskQty=='' ||vsoitemopentaskQty=='null' || vsoitemopentaskQty=='undefined' )
					{
						vsoitemopentaskQty = 0;
					}
					if(vsoitemErpConfirmedQty ==null || vsoitemErpConfirmedQty=='' ||vsoitemErpConfirmedQty=='null' || vsoitemErpConfirmedQty=='undefined' )
					{
						vsoitemErpConfirmedQty = 0;
					}
					if(vsoitemNSReceivedQty ==null || vsoitemNSReceivedQty=='' ||vsoitemNSReceivedQty=='null' || vsoitemNSReceivedQty=='undefined' )
					{
						vsoitemNSReceivedQty = 0;
					}

					
						
					vsoitemopentaskQty=new Big(vsoitemopentaskQty);
					vsoitemErpConfirmedQty=new Big(vsoitemErpConfirmedQty);
					vsoitemNSReceivedQty=new Big(vsoitemNSReceivedQty);
					var vsoitemRcvQty = Number(vsoitemopentaskQty.plus(vsoitemErpConfirmedQty).plus((vsoitemNSReceivedQty.minus(vsoitemErpConfirmedQty))));
					nlapiLogExecution('DEBUG', 'vsoitemRcvQty', vsoitemRcvQty);
					if(vsoitemRcvQty==null || vsoitemRcvQty=='')
						vsoitemRcvQty=0;
					if(vsoitemfulfillQty==null || vsoitemfulfillQty=='')
						vsoitemfulfillQty=0;
					if(vsoitemQty==null || vsoitemQty=='')
						vsoitemQty=0;
				
						
					vsoitemQty=new Big(vsoitemQty);
					vsoitemfulfillQty=new Big(vsoitemfulfillQty);
				
					var vSoreminqty = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus(vsoitemRcvQty));
					nlapiLogExecution('DEBUG', 'vSoreminqty', vSoreminqty);
					var vNSShipComplete = ordsearchresult.getValue('shipcomplete',null,'group');


					if(vReprint == 'F' && parseFloat(vSoreminqty) > 0)
					{
						if(vsolinepickgeneratedQty==null || vsolinepickgeneratedQty=='' ||vsolinepickgeneratedQty=='null' || vsolinepickgeneratedQty=='undefined' )
						{
							vsolinepickgeneratedQty = 0;
						}
						
						
						vsoitemQty=new Big(vsoitemQty);
						vsoitemfulfillQty=new Big(vsoitemfulfillQty);
						vsolinepickgeneratedQty=new Big(vsolinepickgeneratedQty);
						vsoitemErpConfirmedQty=new Big(vsoitemErpConfirmedQty);
						vsoitemNSReceivedQty=new Big(vsoitemNSReceivedQty);
						var qtyToPickGen = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus((vsolinepickgeneratedQty).plus(vsoitemNSReceivedQty).minus(vsoitemErpConfirmedQty))); 
						nlapiLogExecution('ERROR', 'qtyToPickGen', qtyToPickGen);
						
						if(qtyToPickGen <= 0)
						{
							vSoreminqty = 0;
						}
					}
					nlapiLogExecution('Error','vSoreminqty', vSoreminqty);
					nlapiLogExecution('Error','vsolinepickgeneratedQty', vsolinepickgeneratedQty);



					if(vshipcomplete != null && vshipcomplete != '' && vshipcomplete != 'null' && vshipcomplete != 'undefined' && vshipcomplete =='T' && vNSShipComplete == 'T' && vSoreminqty > 0)
					{
						var tranType=  ordsearchresult.getValue('type',null,'group');
						nlapiLogExecution('Debug','Remaining usage at the end of Item fulfillment start ',ctx.getRemainingUsage());
						var type= '';
						if(tranType == 'SalesOrd')
						{
							type = 'salesorder';
						}
						else
						{
							type = 'transferorder';
						}
						var SOid=  ordsearchresult.getValue('internalid',null,'group');



//						nlapiLogExecution('Debug','Remaining usage at the end of Item fulfillment end ',ctx.getRemainingUsage());
//						var SoLinesCount = 0;
//						if(SOSearchResults != null && SOSearchResults != '' && SOSearchResults != 'null' && SOSearchResults.length > 0 )
//						{


//						//SoLinesCount =  SOSearchResults.length;
//						}
						if(backOrderFlag == false)
						{
							var SOIntID = SOid;var committedLinesCount = 0;
							var SoLinesCount=0; var  shipcompleteSOIntID = SOid;


							for(var sorderlist=k; sorderlist<orderList.length && (shipcompleteSOIntID == SOid); sorderlist++)
							{


								if(orderList[sorderlist] != null && orderList[sorderlist] != '' && orderList[sorderlist] !='null' && orderList[sorderlist] != 'undefined')
								{
									shipcompleteSOIntID = orderList[sorderlist].getValue('internalid',null,'group');
								}
								
								

								for(var shipcompleteresults=0;shipcompleteresults<SOSearchResults.length;shipcompleteresults++)
								{
									var vOrderid = SOSearchResults[shipcompleteresults].getValue('internalid',null,'group');
									
									if(shipcompleteSOIntID==vOrderid)
									{
										SoLinesCount=SOSearchResults[shipcompleteresults].getValue('line',null,'count');
										//SoLinesCount = parseInt(SoLinesCount)+1;
										break;
									}

								}
								
								break;
							}
							for(var j=k; j<orderList.length && (backOrderFlag==false && SOIntID == SOid); j++)
							{
								committedLinesCount = parseInt(committedLinesCount)+1;
								var vsoitemCommitedQty=orderList[j].getValue(vColumnslist[commitedQtyIndex]);
								var vconversionrate=orderList[j].getValue(vColumnslist[conversionRateIndex]);
								var vsoitemOrderQty=orderList[j].getValue('quantity',null,'max');
								if(orderList[j+1] != null && orderList[j+1] != '' && orderList[j+1] !='null' && orderList[j+1] != 'undefined')
								{
									SOIntID = orderList[j+1].getValue('internalid',null,'group');
								}
								
								if(vsoitemCommitedQty ==null || vsoitemCommitedQty == 'null' || vsoitemCommitedQty == '' || vsoitemCommitedQty == 'undefined')
								{
									vsoitemCommitedQty = 0;
								}
								if(vsoitemOrderQty ==null || vsoitemOrderQty == 'null' || vsoitemOrderQty == '' || vsoitemOrderQty == 'undefined')
								{
									vsoitemOrderQty = 0;
								}
								if(vconversionrate!=null && vconversionrate!='')
								{
									vsoitemOrderQty=Number(Big(vsoitemOrderQty).div(vconversionrate));
								}
								
								var backorderQty = Number(Big(vsoitemOrderQty).minus(vsoitemCommitedQty));
								nlapiLogExecution('Error','backorderQty', backorderQty);
								
								if(backorderQty > 0)
								{
									backOrderFlag =true;
									backordList.push(ordsearchresult.getValue('tranid',null,'group'));
									break;
								}

							}
						}

						if(parseInt(committedLinesCount) != parseInt(SoLinesCount))
						{
							backordList.push(ordsearchresult.getValue('tranid',null,'group'));
							backOrderFlag =true;
						}
					}




					if(parseFloat(vSoreminqty) > 0 && backOrderFlag == false)
					{	
						orderListArray[orderListArray.length]=ordsearchresult;//ordsearchresult.getValue('tranid',null,'group');	
						orderListArrayFltr[orderListArrayFltr.length]=ordsearchresult.getValue('tranid',null,'group');
					}

					if(ctx.getRemainingUsage()<= 500)
					{
						break;
					}
				}
			}
		}

		if(orderListArray.length > 10)
		{
			var select= form.addField('custpage_selectpage','select', 'Select Orders');	
			select.setLayoutType('outsidebelow', 'startrow');			
			select.setDisplaySize(200,30);
			if(request.getParameter('custpage_selectpage') != null && request.getParameter('custpage_selectpage') != 'null' && request.getParameter('custpage_selectpage') != '' && request.getParameter('custpage_selectpage') != 'undefined')
			{
				select.setDefaultValue(request.getParameter('custpage_selectpage'));	
			}


			var len = orderListArray.length/parseFloat(10);
			for(var k=1;k<=Math.ceil(len);k++)
			{

				var from;var to;

				to=parseFloat(k)*parseFloat(10);
				from=(parseFloat(to)-parseFloat(10))+1;


				var selectvalues=from.toString()+" to "+to.toString();
				var selectvalues_display=from.toString()+","+to.toString();
				select.addSelectOption(selectvalues_display,selectvalues);

			}

		}
	}
	return orderListArray;
}
function  SelectPage_fieldchanged(type,name)
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



}
function getShipmethods(location){

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

function getLocationName(vRoleLocation)
{
	var locationArray=new Array();

	nlapiLogExecution('ERROR', 'vRoleLocation', vRoleLocation);
	var filters=new Array();
	if(vRoleLocation!=null && vRoleLocation!='')
		filters.push(new nlobjSearchFilter('internalid', null, 'anyof', vRoleLocation));
	var columns=new Array();
	columns.push(new nlobjSearchColumn('name'));
	var searchresults = nlapiSearchRecord('location', null, filters, columns);
	if(searchresults!=null && searchresults!='')
	{
		for(var i=0;i<searchresults.length;i++)
		{
			locationArray[i]=new Array();
			locationArray[i][0]=searchresults[i].getId();
			locationArray[i][1]=searchresults[i].getValue('name');
		}
	}
	searchresults=null;
	columns=null;
	filters=null;
	return locationArray;
}



function gotopickstatus()
{
	var vPickReportno = nlapiGetFieldValue('custpage_pickreportno');
	var PickQBURL = nlapiResolveURL('SUITELET', 'customscript_wmsse_pickstatusreport', 'customdeploy_wmsse_pickstatusreport');
	PickQBURL = PickQBURL+ '&custparam_pickreportno='+ vPickReportno;
	window.location.href = PickQBURL;
}
