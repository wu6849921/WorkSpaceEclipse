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
		var form = nlapiCreateForm('Multi-Order Pick Report Scheduler');
		createform(form);
		form.addSubmitButton('Display');
		response.writePage(form);
		//var arrSodetails = getSOLineDetailsNew(getSONo,trantype);
	}
	else
	{
		var form = nlapiCreateForm('Multi-Order Pick Report Scheduler');

		var vQbOrdNo = request.getParameter('custpage_qbso');
		var vQbTranType = request.getParameter('custpage_trantype');
		var vQbLocation = request.getParameter('custpage_whlocation');
		var vQbCustomer = request.getParameter('custpage_qbcustomer');
		var vQbShipDate = request.getParameter('custpage_qbshipdate');
		var vReprint = request.getParameter('custpage_reprint');
		var vnoofLines = request.getParameter('custpage_nooflines');
		var vQty = request.getParameter('custpage_qty');
		var vshipcomplete = request.getParameter('custpage_shipcomplete');
		var vPickReportNo = request.getParameter('custpage_pickreportno');
		var vEmployee = request.getParameter('custpage_qbemployee');
		var hiddenSelectFlag = request.getParameter('custpage_hiddenfieldselectpage')
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

		form.setScript('customscript_wmsse_multiorpickrpt_sch_cl');
		nlapiLogExecution('ERROR', 'vQbOrdNo', vQbOrdNo); 
		nlapiLogExecution('ERROR', 'vQbCustomer', vQbCustomer); 
		nlapiLogExecution('ERROR', 'vQbShipDate', vQbShipDate); 
		nlapiLogExecution('ERROR', 'vQbTranType', vQbTranType); 
		nlapiLogExecution('ERROR', 'vReprint', vReprint); 
		nlapiLogExecution('ERROR', 'vshipcomplete', vshipcomplete); 
		nlapiLogExecution('ERROR', 'vQty', vQty); 
		nlapiLogExecution('ERROR', 'vnoofLines', vnoofLines); 
		nlapiLogExecution('ERROR', 'vEmployee', vEmployee); 
		nlapiLogExecution('ERROR', 'vPickReportNo', vPickReportNo); 
		nlapiLogExecution('ERROR', 'hiddenSelectFlag', hiddenSelectFlag);
		var lineCount = request.getLineItemCount('custpage_items');
		nlapiLogExecution('ERROR','lineCount',lineCount);
		var orderNum ="";
		var refreshpage = false;
		if(lineCount!=null && lineCount > 0)	
		{
			for (var k2=1; k2<=lineCount; k2++){
				if((request.getLineItemValue('custpage_items', 'custpage_select', k2) == 'T') && hiddenSelectFlag !='T'){
					if(orderNum ==null || orderNum =='')
						orderNum=request.getLineItemValue('custpage_items', 'custpage_sointernalid', k2);
					else
						orderNum = orderNum +","+request.getLineItemValue('custpage_items', 'custpage_sointernalid', k2);
					refreshpage=true;
				}	
			}
		}	

		if (refreshpage==false)
		{
			var Sodetails = null;
			var arrSodetails = null;

			if((vQbOrdNo != null && vQbOrdNo != "" ) || (vQbTranType != null && vQbTranType != ''))
			{
				arrSodetails = getSOLineDetailsforpickreports(vQbOrdNo,null,vQbTranType,vQbCustomer,vQbShipDate,vReprint,vQty,vnoofLines,vshipcomplete,vQbLocation,vQbOrderType,vQbdepartment,vQbClass,vQbshipmethod,vQbitemfamily,vQbitemgroup);
			}
			if(arrSodetails!=null && arrSodetails!='' && arrSodetails.length>0)
			{
				Sodetails = setPagingForSublist(form,arrSodetails,vshipcomplete,vReprint);
			}
			if(Sodetails !=null && Sodetails !='' && Sodetails.length>0)
			{
				form.addButton('custpage_print','Print','Printreport()');
				createform(form);
				form.addSubmitButton('Display');
				var sublist = form.addSubList("custpage_items", "list", "Order List");
				sublist.addField("custpage_select", "checkbox", "Confirm").setDefaultValue('F');
				sublist.addField("custpage_sono", "text", "Transaction #"); 
				sublist.addField("custpage_whloc", "text", "Location"); 
				sublist.addField("custpage_customer", "text", "Customer"); 
				//sublist.addField("custpage_shipdate", "text", "Ship Date"); 
				sublist.addField("custpage_shipdate", "date", "Ship Date"); 
				sublist.addField("custpage_department", "text", "Department"); 
				sublist.addField("custpage_classs", "text", "Class"); 
				sublist.addField("custpage_shpmethod", "text", "Ship Method"); 
				sublist.addField("custpage_sointernalid", "text", "So InternalId").setDisplayType('hidden'); 
				sublist.addField("custpage_linescount", "text", "No Of Lines").setDisplayType('hidden'); 
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
					else
					{

					}
				}
				var minval=0;var maxval=parseFloat(Sodetails.length);

				var selectno=request.getParameter('custpage_selectpage');
				nlapiLogExecution('Error','selectno', selectno);
				if(selectno!=null && selectno!='null'  && selectno!=undefined && selectno!= '' && Sodetails.length > 100)
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
					if(Sodetails.length > 100)
					{
						maxval = 99;
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
							var vsoitemRcvQty = Number(vsoitemopentaskQty.plus(vsoitemErpConfirmedQty).plus((vsoitemNSReceivedQty).minus(vsoitemErpConfirmedQty)));
							nlapiLogExecution('DEBUG','vsoitemRcvQty in big',vsoitemRcvQty);
													
							
							if(vsoitemRcvQty==null || vsoitemRcvQty=='')
								vsoitemRcvQty=0;
							if(vsoitemfulfillQty==null || vsoitemfulfillQty=='')
								vsoitemfulfillQty=0;
							if(vsoitemQty==null || vsoitemQty=='')
								vsoitemQty=0;
							
							vsoitemQty=new Big(vsoitemQty);
							vsoitemfulfillQty=new Big(vsoitemfulfillQty);
							vsoitemRcvQty=new Big(vsoitemRcvQty);
							var vSoreminqty = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus(vsoitemRcvQty));
							nlapiLogExecution('DEBUG','vSoreminqty in Big',vSoreminqty);
														
										
							
							if(parseFloat(vSoreminqty) > 0)
							{	

								form.getSubList('custpage_items').setLineItemValue('custpage_sono', p, vSORecord.getValue('tranid',null,'group'));
								form.getSubList('custpage_items').setLineItemValue('custpage_whloc', p, vLocname);
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
				//showInlineMessage(form, 'ERROR', 'No results found');
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
		}
		else
		{
			var param = new Array();
			param['custscript_wmsse_orderno_lst'] = orderNum;
			param['custscript_wmsse_pick_rptno'] = vPickReportNo;
			param['custscript_wmsse_trantype'] = vQbTranType;
			param['custscript_wmsse_customer'] = vQbCustomer;
			param['custscript_wmsse_shipdate'] = vQbShipDate;
			param['custscript_wmsse_qbqty'] = vQty;
			param['custscript_wmsse_nooflines'] = vnoofLines;
			param['custscript_wmsse_shipcomplete'] = vshipcomplete;
			param['custscript_wmsse_qbemployee'] = vEmployee;
			param['custscript_wmsse_ordertype'] = vQbOrderType;
			param['custscript_wmsse_department']=vQbdepartment;
			param['custscript_wmsse_class']=vQbClass;
			param['custscript_wmsse_reprint']=vReprint;
			param['custscript_wmsse_whlocation']=vQbLocation;
			nlapiLogExecution('DEBUG', 'Invoking Schedule Script Starts');
			var schstatus = nlapiScheduleScript('customscript_wmsse_multiord_pickrpt_sch', null,param);
			nlapiLogExecution('DEBUG', 'Scheduled Script Status',schstatus);
			if ( schstatus != 'QUEUED' ) {
				var schstatus1 = nlapiScheduleScript('customscript_wmsse_multiord_pickrpt_sch', null,param);
				   nlapiLogExecution('DEBUG', 'Scheduled Script Status Retry',schstatus1); 
			}
			var currentUserID = getCurrentUser();
			updateScheduleScriptStatus('PICK REPORT',currentUserID,'Submitted',vPickReportNo,vQbTranType);
			// var msg = form.addField('custpage_message', 'inlinehtml', null, null, null).setLayoutType('outside','startrow');	
			//var msg = form.addField('custpage_message', 'inlinehtml', null, null, null);
			//msg.setLayoutType('outside','startcol');
			//msg.setDefaultValue("<div id='div__alert' align='center'><script>showAlertBox('div__alert', 'Error', 'Pick report process has been initiated for pick report no: "+vPickReportNo+", NLAlertDialog.TYPE_LOW_PRIORITY,  '100%', null, null, null);</script></div>");
			//createform(form);
			var vnewPickReportNo = form.addField('custpage_pickreportno', 'text', 'Pick Report No').setDisplayType('hidden');
			if(request.getParameter('custpage_pickreportno')!='' && request.getParameter('custpage_pickreportno')!=null)
			{
				vnewPickReportNo.setDefaultValue(request.getParameter('custpage_pickreportno'));
			}
			if(vReprint == 'T')
			{
				showInlineMessage(form, 'Confirmation', 'Pick report for the selected orders successfully scheduled for generation. ');
			}
			else
			{
				showInlineMessage(form, 'Confirmation', "Pick report number "+vPickReportNo+" successfully scheduled for generation. ");
			}


			form.addButton('custpage_pickstatus','Pick Report Status','gotopickstatus()');
		}
		response.writePage(form);

	}	
}

function createform(form)
{

	var soField = form.addField('custpage_qbso', 'text', 'Transaction #');
	var vSo = request.getParameter('custpage_qbso');
	//soField.setMandatory(true);
	soField.setDefaultValue(vSo);	
	var hiddenField_selectpage = form.addField('custpage_hiddenfieldselectpage', 'text', '').setDisplayType('hidden');
	hiddenField_selectpage.setDefaultValue('F');


	var whLocation = form.addField('custpage_whlocation', 'select', 'Location').setMandatory(true);
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
	//OrderType.addSelectOption("","");
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
	var vPickReportNo = form.addField('custpage_pickreportno', 'text', 'Pick Report No').setDisplayType('hidden');
	if(request.getParameter('custpage_pickreportno')!='' && request.getParameter('custpage_pickreportno')!=null)
	{
		vPickReportNo.setDefaultValue(request.getParameter('custpage_pickreportno'));
	}
	else
	{
		var currentUserID = getCurrentUser();

		var	vPickGen = currentUserID+"_"+ getTimeStamp();
		vPickReportNo.setDefaultValue(vPickGen);
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
function Printreport()
{

	var vSo = nlapiGetFieldValue('custpage_qbso');
	var vOrderType = nlapiGetFieldValue('custpage_trantype');
	var vCustomer = nlapiGetFieldValue('custpage_qbcustomer');
	var vShipDate = nlapiGetFieldValue('custpage_qbshipdate');

	var vEmployee = nlapiGetFieldValue('custpage_qbemployee');
	var vnoofLines = nlapiGetFieldValue('custpage_nooflines');
	var vQty = nlapiGetFieldValue('custpage_qty');
	var vshipcomplete = nlapiGetFieldValue('custpage_shipcomplete');
	var whLocation = nlapiGetFieldValue('custpage_whlocation');
	var vPickReportno = nlapiGetFieldValue('custpage_pickreportno');
	var lincount = nlapiGetLineItemCount('custpage_items');
	var orderType = nlapiGetFieldValue('custpage_ordertype');
	var vrePrint = nlapiGetFieldValue('custpage_reprint');
	var orderNum=new Array();
	var orderNum=new Array;
	var selectedFlag='F';
	var ordStr = '';
	var unprintedArray = new Array();
	var printedArray = new Array();

	for (var p = 1; p <= lincount; p++) 
	{
		var lineSelected = nlapiGetLineItemValue('custpage_items', 'custpage_select', p);
		if(lineSelected=='T')
		{
			var vOrd = nlapiGetLineItemValue('custpage_items', 'custpage_sointernalid', p);
			var vOrdNum = nlapiGetLineItemValue('custpage_items', 'custpage_sono', p);
			/*var vAlreadyPickedDetails=fnGetPickCompletedDetails(vOrd,whLocation);
			if(vAlreadyPickedDetails != null && vAlreadyPickedDetails != '' && vAlreadyPickedDetails.length>0)
			{
				alert('Picking process is already initiated for this order# '+vOrdNum);
				nlapiSetLineItemValue('custpage_items', 'custpage_select', p,'F');
				return false;
			}*/
			var vAlreadyPickedDetails=fnGetPickReportDetails(vOrd,whLocation);
			if((vAlreadyPickedDetails == null || vAlreadyPickedDetails == '' || vAlreadyPickedDetails == 'null') && vrePrint == "T")
			{
				var lineNo = p;
				var str = vOrdNum+":"+lineNo;
				unprintedArray.push(str);
				selectedFlag='F';
			}
//			else if((vAlreadyPickedDetails != null && vAlreadyPickedDetails != '' && vAlreadyPickedDetails !='null') && vrePrint == "F")
//			{				
//				var lineNo = p;
//				var str = vOrdNum+":"+lineNo;
//				printedArray.push(str);
//				selectedFlag='F';
//
//			}
			else
			{
				orderNum.push(vOrd);
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

		alert('Pick reports for the following selected orders have not yet been generated: '+ordStr+'.');
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
	nlapiSetFieldValue('custpage_hiddenfieldselectpage','F');
	NLDoMainFormButtonAction("submitter",true);
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


	var objPickSearchResults = new nlapiSearchRecord('customrecord_wmsse_trn_opentask', null, filters, null);//not in use
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
	if(SOIntId != null && SOIntId != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', SOIntId));

	if(WHLocation != null && WHLocation != '')
		filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', WHLocation));

	//filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof',3));
	//filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', [9])); // 9 - Pick Locations Assigned
	//var columns=new Array();
	//columns.push(new nlobjSearchColumn('custrecord_wmsse_order_no'));
	var objPickSearchResults = nlapiSearchRecord('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_pickreportdetails', filters, null);
	return objPickSearchResults;
}

/**
 * 
 * @param SOIntId
 */
function setPagingForSublist(form,orderList,vshipcomplete,vReprint)
{
	if(orderList != null && orderList.length > 0){
		var vColumnslist=orderList[0].getAllColumns();


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
		var orderListArray=new Array();	
		var backordList = new Array();
		var orderListArrayFltr = new Array();
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
					var vsoitemRcvQty = Number(vsoitemopentaskQty.plus(vsoitemErpConfirmedQty).plus((vsoitemNSReceivedQty).minus(vsoitemErpConfirmedQty)));
					nlapiLogExecution('DEBUG','vsoitemRcvQty in big',vsoitemRcvQty);
										
					
					if(vsoitemRcvQty==null || vsoitemRcvQty=='')
						vsoitemRcvQty=0;
					if(vsoitemfulfillQty==null || vsoitemfulfillQty=='')
						vsoitemfulfillQty=0;
					if(vsoitemQty==null || vsoitemQty=='')
						vsoitemQty=0;
					
					vsoitemQty=new Big(vsoitemQty);
					vsoitemfulfillQty=new Big(vsoitemfulfillQty);
					vsoitemRcvQty=new Big(vsoitemRcvQty);
					var vSoreminqty = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus(vsoitemRcvQty));
					nlapiLogExecution('DEBUG','vSoreminqty in Big',vSoreminqty);
									
										
					var vNSShipComplete = ordsearchresult.getValue('shipcomplete',null,'group');
					nlapiLogExecution('Error','vSoreminqty', vSoreminqty);
					nlapiLogExecution('Error','vNSShipComplete', vNSShipComplete);

					if(vReprint == 'F' && parseFloat(vSoreminqty) > 0)
					{
						if(vsolinepickgeneratedQty==null || vsolinepickgeneratedQty=='' ||vsolinepickgeneratedQty=='null' || vsolinepickgeneratedQty=='undefined' )
						{
							vsolinepickgeneratedQty = 0;
						}

								
						vsoitemQty=new Big(vsoitemQty);
						vsoitemfulfillQty=new Big(vsoitemfulfillQty);
						vsolinepickgeneratedQty=new Big(vsolinepickgeneratedQty);
						vsoitemNSReceivedQty=new Big(vsoitemNSReceivedQty);
						vsoitemErpConfirmedQty=new Big(vsoitemErpConfirmedQty);
						
						var qtyToPickGen = Number((vsoitemQty.plus(vsoitemfulfillQty)).minus(vsolinepickgeneratedQty.plus(vsoitemNSReceivedQty).minus(vsoitemErpConfirmedQty)));
						nlapiLogExecution('DEBUG','qtyToPickGen in Big if',qtyToPickGen);

												
						if(qtyToPickGen <= 0)
						{
							vSoreminqty = 0;
						}
					}

					if(vshipcomplete != null && vshipcomplete != '' && vshipcomplete != 'null' && vshipcomplete != 'undefined' && vshipcomplete =='T' && vNSShipComplete == 'T' && parseFloat(vSoreminqty) > 0)
					{
						var tranType=  ordsearchresult.getValue('type',null,'group');
						nlapiLogExecution('Error','tranType', tranType);
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
						nlapiLogExecution('Error','SOid', SOid);
						nlapiLogExecution('Error','type', type);
											
						var SOSearchResults=new Array();
						
						var transactionsearchresult = new nlapiLoadSearch(type, 'customsearch_wmsse_transactiondetail_srh');
										
						transactionsearchresult.addFilter(new nlobjSearchFilter('mainline', null, 'is', 'F'));
						transactionsearchresult.addFilter(new nlobjSearchFilter('internalid', null, 'anyof', SOid));
						transactionsearchresult.addFilter(new nlobjSearchFilter('quantity', null, 'greaterthan', 0));
						transactionsearchresult.addFilter(new nlobjSearchFilter('shipping', null, 'is', 'F'));
						transactionsearchresult.addFilter(new nlobjSearchFilter('taxline', null, 'is', 'F'));
						
						var resLenDetails = transactionsearchresult.runSearch();
						
						
						var resultsPage = resLenDetails.getResults(0, 1000);
						var offset = 0;
						while (!!resultsPage && resultsPage.length > 0) 
						{
							SOSearchResults = SOSearchResults.concat(resultsPage);
							offset += 1000;
							resultsPage = resLenDetails.getResults(offset, offset + 1000);
						}

						var SoLinesCount = 0;
						if(SOSearchResults != null && SOSearchResults != '' && SOSearchResults != 'null' && SOSearchResults.length > 0 )
						{
							nlapiLogExecution('Error','committedLinesCount', SOSearchResults.length);

							SoLinesCount =  SOSearchResults.length;
						}
						if(backOrderFlag == false)
						{
							var SOIntID = SOid;var committedLinesCount = 0;
							for(var j=k; j<orderList.length && (backOrderFlag==false && SOIntID == SOid); j++)
							{
								committedLinesCount = parseInt(committedLinesCount)+1;
								var vsoitemCommitedQty=orderList[j].getValue(vColumnslist[commitedQtyIndex]);
								var vsoitemOrderQty=orderList[j].getValue('quantity',null,'max');
								if(orderList[j+1] != null && orderList[j+1] != '' && orderList[j+1] !='null' && orderList[j+1] != 'undefined')
								{
									SOIntID = orderList[j+1].getValue('internalid',null,'group');
								}
								nlapiLogExecution('Error','orderList.getValue(tranid,null,group)', orderList[j].getValue('tranid',null,'group'));
								nlapiLogExecution('Error','vsoitemCommitedQty', vsoitemCommitedQty);
								nlapiLogExecution('Error','vsoitemOrderQty', vsoitemOrderQty);
								if(vsoitemCommitedQty ==null || vsoitemCommitedQty == 'null' || vsoitemCommitedQty == '' || vsoitemCommitedQty == 'undefined')
								{
									vsoitemCommitedQty = 0;
								}
								if(vsoitemOrderQty ==null || vsoitemOrderQty == 'null' || vsoitemOrderQty == '' || vsoitemOrderQty == 'undefined')
								{
									vsoitemOrderQty = 0;
								}
								var backorderQty = parseFloat(vsoitemOrderQty)-parseFloat(vsoitemCommitedQty);
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
				}
			}
		}

		if(orderListArray.length > 100)
		{
			var select= form.addField('custpage_selectpage','select', 'Select Orders');	
			select.setLayoutType('outsidebelow', 'startrow');			
			select.setDisplaySize(200,30);
			if(request.getParameter('custpage_selectpage') != null && request.getParameter('custpage_selectpage') != 'null' && request.getParameter('custpage_selectpage') != '' && request.getParameter('custpage_selectpage') != 'undefined')
			{
				select.setDefaultValue(request.getParameter('custpage_selectpage'));	
			}


			var len = orderListArray.length/parseFloat(100);
			for(var k=1;k<=Math.ceil(len);k++)
			{

				var from;var to;

				to=parseFloat(k)*parseFloat(100);
				from=(parseFloat(to)-parseFloat(100))+1;


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

function getTimeStamp(){
	var timestamp='';
	var now = new convertDate();

	//Getting time in hh:mm tt format.
	var curr_hour = now.getHours();
	var curr_min = now.getMinutes();
	var curr_sec = now.getSeconds();
	var curr_day = now.getDate();
	var curr_month = (now.getMonth()) + 1;
	var curr_year = now.getFullYear();
	if (curr_min.length == 1)
		curr_min = "0" + curr_min;

	timestamp = curr_day + "" + curr_month + "" + curr_year + "" + curr_hour + "" + curr_min + "" + curr_sec;

	return timestamp;
}

function gotopickstatus()
{
	var vPickReportno = nlapiGetFieldValue('custpage_pickreportno');
	var PickQBURL = nlapiResolveURL('SUITELET', 'customscript_wmsse_pickstatusreport', 'customdeploy_wmsse_pickstatusreport');
	PickQBURL = PickQBURL+ '&custparam_pickreportno='+ vPickReportno;
	window.location.href = PickQBURL;
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
	//columns.push(new nlobjSearchColumn('name'));
	var searchresults = nlapiSearchRecord('location', 'customsearch_wmsse_locsearchresults', filters, columns);
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
