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
function Packing(request, response){
	if (request.getMethod() == 'GET') {


		var form = nlapiCreateForm('Multi-Order Packing');
		var pickRptNO = form.addField('custpage_pickrptno', 'text', 'Pick Report #').setDisplaySize(43);
		var soField = form.addField('custpage_order', 'text', 'Transaction #').setDisplaySize(43);
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
		var TranType = form.addField('custpage_trantype', 'select', 'Transaction Type').setMandatory(true).setDisplaySize(150);
		// OrderType.addSelectOption("","");
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
		var objCustomer = form.addField('custpage_customer', 'select', 'customer','customer').setDisplaySize(100);
		var objShipDate = form.addField('custpage_ship_date', 'date', 'Ship Date').setDisplaySize(450);


		if(request.getParameter('custpage_pickrptno')!='' && request.getParameter('custpage_pickrptno')!=null)
		{
			pickRptNO.setDefaultValue(request.getParameter('custpage_pickrptno'));	
		}

		var selectprintername=form.addField('custpage_printername', 'select', 'Printer Name').setDisplaySize(300);
		selectprintername.addSelectOption("","");
		var ShipMethod = form.addField('custpage_shipmethod', 'select', 'Ship Method');
		ShipMethod.addSelectOption("","");
		if(request.getParameter('custpage_shipmethod')!='' && request.getParameter('custpage_shipmethod')!=null)
		{
			ShipMethod.setDefaultValue(request.getParameter('custpage_shipmethod'));	
		}
		var shipmethodResults = getShipmethods(null);
		nlapiLogExecution('DEBUG', 'shipmethodResults', shipmethodResults);
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

		var VactualBeginTime = form.addField('custpage_actualbegintime','text','Actual Begin Time').setDisplayType('hidden');


		// Retrieve all Work Stations
		var printernameList = getAllprinternames();

		// Add all Work Stations to workstation Field
		addAllPrinterNamesToField(form,selectprintername, printernameList);


		form.addSubmitButton('Display');
		response.writePage(form);
	}
	else {
		var form = nlapiCreateForm('Multi-Order Packing');

		var actualBeginTime = TimeStamp();
		

		nlapiLogExecution('DEBUG', 'into', 'response');
		var msg = form.addField('custpage_message', 'inlinehtml', null, null, null).setLayoutType('outside','startrow');		  

		var Printer=request.getParameter('custpage_printername');
		//form.addSubmitButton('Submit');

		form.addButton('custpage_generatesearch','New Order','backtogeneratesearch()');
		form.setScript('customscript_wmsse_bulk_packing_cl');
		var SOarray = new Array();
		SOarray["custpage_order"]=request.getParameter('custpage_order');
		SOarray["custpage_ordertype"]=request.getParameter('custpage_ordertype');
		SOarray["custpage_printername"]=request.getParameter('custpage_printername');
		SOarray["custpage_actualbegintime"]=actualBeginTime;
		SOarray["custpage_qbwhlocation"]=request.getParameter('custpage_qbwhlocation');
		

		var	st0 = "Please enter Order#";
		var	st1 = "Please enter valid Order#  "; 
		//case no 201410336
		var	st2 = "Confirmation:Item Fulfillment posted successfully";

		var lineCount = request.getLineItemCount('custpage_packinglist');
		nlapiLogExecution('DEBUG','lineCount',lineCount);
		if(lineCount!=-1)
		{
			var contlp = request.getParameter('custpage_carton');
			var isValid=validateContLp(contlp);
			if(isValid=='F')
			{
				nlapiLogExecution('DEBUG','invalid contlp');
				msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', 'This container was already scanned.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
				response.writePage(form);	
			}
			else
			{
				var Printer=request.getParameter('custpage_printername');
				form.setScript('customscript_wmsse_bulk_packing_cl');
				processSelectedContainers(request, response, form,msg);
			}
			//response.writePage(form);
		}
		else
		{
			try
			{
				
				var ctx = nlapiGetContext();
				var blnMultiShipEnabled = ctx.getFeature('multishipto');
				
				var pickRptNO = form.addField('custpage_pickrptno', 'text', 'Pick Report #').setDisplaySize(43).setDisplayType ("inline");
				var soField = form.addField('custpage_order', 'text', 'Transaction #').setDisplaySize(43).setDisplayType('inline');
				var vLocation = form.addField('custpage_qbwhlocation', 'select', 'Location').setDisplaySize(150).setDisplayType ("inline");
				if(request.getParameter('custpage_qbwhlocation')!='' && request.getParameter('custpage_qbwhlocation')!=null)
				{
					vLocation.setDefaultValue(request.getParameter('custpage_qbwhlocation'));	
				}

				vLocation.addSelectOption("","");

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
							vLocation.addSelectOption(roleBasedLocationArray[j][0], roleBasedLocationArray[j][1]);
						}
					}
				}
				if(vRolebasedLocation.length==1)
				{
					vLocation.setDefaultValue(vRolebasedLocation[0]);	
				}
				var TranType = form.addField('custpage_trantype', 'select', 'Transaction Type').setMandatory(true).setDisplaySize(400).setDisplayType('inline');
				//OrderType.addSelectOption("","");
				TranType.addSelectOption("salesorder","Sales Order");
				TranType.addSelectOption("transferorder","Transfer Order");
				if(request.getParameter('custpage_trantype')!='' && request.getParameter('custpage_trantype')!=null)
				{
					TranType.setDefaultValue(request.getParameter('custpage_trantype'));	
				}
				var OrderType = form.addField('custpage_ordertype', 'select', 'Order Type','customrecord_wmsse_ordertype').setDisplaySize(150).setDisplayType ("inline");
				if(request.getParameter('custpage_ordertype')!='' && request.getParameter('custpage_ordertype')!=null)
				{
					OrderType.setDefaultValue(request.getParameter('custpage_ordertype'));	
				}
				var department = form.addField('custpage_dept', 'select', 'Department','department').setDisplaySize(150).setDisplayType ("inline");
				if(request.getParameter('custpage_dept')!='' && request.getParameter('custpage_dept')!=null)
				{
					department.setDefaultValue(request.getParameter('custpage_dept'));	
				}
				var vclass = form.addField('custpage_class', 'select', 'Class','classification').setDisplaySize(150).setDisplayType ("inline");
				if(request.getParameter('custpage_class')!='' && request.getParameter('custpage_class')!=null)
				{
					vclass.setDefaultValue(request.getParameter('custpage_class'));	
				}
				var objCustomer = form.addField('custpage_customer', 'select', 'customer','customer').setDisplaySize(100).setDisplayType ("inline");
				var objShipDate = form.addField('custpage_ship_date', 'date', 'Ship Date').setDisplaySize(450).setDisplayType ("inline");

				if(request.getParameter('custpage_pickrptno')!='' && request.getParameter('custpage_pickrptno')!=null)
				{
					pickRptNO.setDefaultValue(request.getParameter('custpage_pickrptno'));	
				}

				soField.setLayoutType('outside','none');

				if(request.getParameter('custpage_order')!='' && request.getParameter('custpage_order')!=null)
				{
					soField.setDefaultValue(request.getParameter('custpage_order'));	
				}				
				if(request.getParameter('custpage_customer')!='' && request.getParameter('custpage_customer')!=null)
				{
					objCustomer.setDefaultValue(request.getParameter('custpage_customer'));	
				}
				if(request.getParameter('custpage_ship_date')!='' && request.getParameter('custpage_ship_date')!=null)
				{
					objShipDate.setDefaultValue(request.getParameter('custpage_ship_date'));	
				}
				var ShipMethod = form.addField('custpage_shipmethod', 'select', 'Ship Method').setDisplayType ("inline");
				ShipMethod.addSelectOption("","");
				if(request.getParameter('custpage_shipmethod')!='' && request.getParameter('custpage_shipmethod')!=null)
				{
					ShipMethod.setDefaultValue(request.getParameter('custpage_shipmethod'));	
				}
				var shipmethodResults = getShipmethods(null);
				nlapiLogExecution('DEBUG', 'shipmethodResults', shipmethodResults);
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

				var VactualBeginTime = form.addField('custpage_actualbegintime','text','Actual Begin Time').setDisplayType('hidden');
				VactualBeginTime.setDefaultValue(actualBeginTime);	
				nlapiLogExecution('DEBUG','VactualBeginTime',VactualBeginTime);

				var getSOid=request.getParameter('custpage_order');

				var tranType =request.getParameter('custpage_trantype');
				var strCustomerId =request.getParameter('custpage_customer');
				var strShipDate =request.getParameter('custpage_ship_date');

				

				var SOtrantypefilters=new Array();
				var soid='';
				var whLoc = '';
				if(getSOid != null && getSOid != '')
				{	
					SOtrantypefilters.push(new nlobjSearchFilter('tranid',null,'is',getSOid));
					//SOtrantypefilters.push(new nlobjSearchFilter('mainline', null, 'is', 'F'));
					SOtrantypefilters.push(new nlobjSearchFilter('status', null, 'anyof', ['SalesOrd:B','SalesOrd:D','SalesOrd:E','TrnfrOrd:B','TrnfrOrd:D','TrnfrOrd:E']));
					SOtrantypefilters.push(new nlobjSearchFilter('shipping', null, 'is', 'F'));//To avoid shipping lines.
					SOtrantypefilters.push(new nlobjSearchFilter('taxline', null, 'is', 'F'));//To avoid tax lines.

					var SOtrantypecols=new Array();
					SOtrantypecols[0]=new nlobjSearchColumn('internalid');
					SOtrantypecols.push(new nlobjSearchColumn('shipgroup'));
					SOtrantypecols.push(new nlobjSearchColumn('shipmethod'));
					SOtrantypecols.push(new nlobjSearchColumn('location'));
					SOtrantypecols.push(new nlobjSearchColumn('line').setSort());
					if(blnMultiShipEnabled)
						SOtrantypecols.push(new nlobjSearchColumn('ismultishipto'));
					var SORecinternalids=nlapiSearchRecord(tranType,null,SOtrantypefilters,SOtrantypecols);
					if(SORecinternalids!=null && SORecinternalids!='' && SORecinternalids != 'null')
					{
						soid = SORecinternalids[0].getValue('internalid');
						whLoc = SORecinternalids[0].getValue('location');

						
						if(SORecinternalids.length > 1)
						{
							var SOshipgroup = '';
							var SOshipmethod = '';
							var SOisshipto = '';
							var SOlineno = '';
							var ismultilineship='F';
							var Shiparray = new Array();
							var shipMethodArray = new Array();
							for(var v = 1 ; v < SORecinternalids.length; v++)
							{					
								SOshipgroup = SORecinternalids[v].getValue('shipgroup');
								SOshipmethod = SORecinternalids[v].getValue('shipmethod');
								SOshipline = SORecinternalids[v].getValue('line');
								if(blnMultiShipEnabled)
								SOisshipto = SORecinternalids[v].getValue('ismultishipto');
								
								var shiptodets = [SOshipgroup,SOshipline,SOisshipto];
								
								Shiparray.push(shiptodets);		
								if(shipMethodArray.indexOf(SOshipmethod) == -1)
								{
									shipMethodArray.push(SOshipmethod);
								}
								
							}
							if(request.getParameter('custpage_shipmethod') !=  null && request.getParameter('custpage_shipmethod') != '' && request.getParameter('custpage_shipmethod') != 'null' && request.getParameter('custpage_shipmethod') != 'undefined' && shipMethodArray.indexOf(request.getParameter('custpage_shipmethod'))==-1)
							{
								msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', 'Please enter valid ship method.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");	

								response.writePage(form);
								return;
							}
							
						}
					}
					else
					{
						msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Confirmation', 'Please enter valid order #.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
						response.writePage(form);
						return;
					}
				} 

				var soInternalIds=new Array();
				var getPickreportid = request.getParameter('custpage_pickrptno');
				if(getPickreportid != null && getPickreportid != '' && getPickreportid != 'null' && getPickreportid != 'undefined')
				{
					var validPickReportNo = funtoCheckPickReportNo(getPickreportid);
					nlapiLogExecution('DEBUG','validPickReportNo',validPickReportNo);
					
					if(validPickReportNo!=null && validPickReportNo!=''){

						for(var j=0;j<validPickReportNo.length;j++)
						{
							if(soInternalIds.indexOf(validPickReportNo[j].getValue('custrecord_wmsse_order_no'))==-1)
							{
								soInternalIds.push(validPickReportNo[j].getValue('custrecord_wmsse_order_no'));
							}
						}
						if(soid !=null && soid !='' && soid !='null' && soid != 'undefined' )
						{
							if(soInternalIds.indexOf(soid)==-1)
							{
								msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Confirmation', 'This pick report# does not belongs to order # "+getSOid+"', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
								response.writePage(form);
								return;
							}
						}
					}
					else
					{
						msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Confirmation', 'Please enter valid pickreport #.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
						response.writePage(form);
						return;
					}

				}


				//var soid='';

				
				SOarray["custparam_trantype"] = tranType;

				var vType='';
				if(tranType=='salesorder')
					vType='SalesOrd';
				else if(tranType=='transferorder')
					vType='TrnfrOrd';

				var filters = new Array();
				if(soInternalIds != null && soInternalIds != 'null' && soInternalIds != '' && soInternalIds.length > 0)
				{
					filters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', soInternalIds));
				}
				else
				{
					if(soid != null && soid != '')
						filters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', soid));
				}

				if(strCustomerId != null && strCustomerId != '')
					filters.push(new nlobjSearchFilter('name', 'custrecord_wmsse_order_no', 'anyof',strCustomerId));
				if(strShipDate != null && strShipDate != '')
					filters.push(new nlobjSearchFilter('shipdate', 'custrecord_wmsse_order_no', 'on',strShipDate)); 
				if(vType != null && vType != '')
					filters.push(new nlobjSearchFilter('type', 'custrecord_wmsse_order_no', 'anyof',vType));
				//filters.push(new nlobjSearchFilter('status', 'custrecord_wmsse_order_no', 'anyof', ['SalesOrd:B','SalesOrd:D','SalesOrd:E','TrnfrOrd:B','TrnfrOrd:D','TrnfrOrd:E']));
				if(request.getParameter('custpage_shipmethod')!='' && request.getParameter('custpage_shipmethod')!=null && request.getParameter('custpage_shipmethod')!='null')
				{
					filters.push(new nlobjSearchFilter('custrecord_wmsse_shipmethod', null, 'anyof', request.getParameter('custpage_shipmethod')));
				}
				if(request.getParameter('custpage_ordertype')!='' && request.getParameter('custpage_ordertype')!=null && request.getParameter('custpage_ordertype')!='null')
				{
					filters.push(new nlobjSearchFilter('custrecord_wmsse_ord_type', null, 'anyof', request.getParameter('custpage_ordertype')));
				}
				if(request.getParameter('custpage_dept')!='' && request.getParameter('custpage_dept')!=null && request.getParameter('custpage_dept')!='null')
				{
					filters.push(new nlobjSearchFilter('custrecord_wmsse_dept', null, 'anyof', request.getParameter('custpage_dept')));
				}
				if(request.getParameter('custpage_class')!='' && request.getParameter('custpage_class')!=null && request.getParameter('custpage_class')!='null')
				{
					filters.push(new nlobjSearchFilter('custrecord_wmsse_classification', null, 'anyof', request.getParameter('custpage_class')));
				}
				filters.push(new nlobjSearchFilter('mainline', 'custrecord_wmsse_order_no', 'is','T'));

				if(request.getParameter('custpage_qbwhlocation')!='' && request.getParameter('custpage_qbwhlocation')!=null && request.getParameter('custpage_qbwhlocation')!='null')
				{
					filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', request.getParameter('custpage_qbwhlocation')));
				}
				var opentaskSearchResults=nlapiSearchRecord('customrecord_wmsse_trn_opentask','customsearch_wmsse_openpacks',filters,null);
				nlapiLogExecution('DEBUG','opentaskSearchResults',opentaskSearchResults);
				
				if(opentaskSearchResults != null && opentaskSearchResults != '' && opentaskSearchResults != 'null' && opentaskSearchResults != undefined && (whLoc == null || whLoc == '' || whLoc == 'null' || whLoc == undefined))
				{
					whLoc = opentaskSearchResults[0].getValue('custrecord_wmsse_wms_location',null,'group');
					 if((soInternalIds == null || soInternalIds == '' || soInternalIds == 'null' || soInternalIds == undefined) && (soid == null || soid == '' || soid == 'null' || soid == undefined))
					 {
						 for(var c=0 ; c<opentaskSearchResults.length; c++)
						 {
							 soInternalIds.push(opentaskSearchResults[c].getValue('internalid','custrecord_wmsse_order_no','group'));
						 }
					 }
				}
				
				var VSoremqtyArray = new Array();
				
				var FULFILLMENTATORDERLEVEL= 'F';
				nlapiLogExecution('DEBUG', 'whLoc', whLoc);
				if(whLoc != null && whLoc != '' && whLoc != 'null' && whLoc != undefined)
					FULFILLMENTATORDERLEVEL = getSystemRuleValue('Consolidate item fulfillments by sales order?',whLoc);					
				nlapiLogExecution('DEBUG', 'FULFILLMENTATORDERLEVEL', FULFILLMENTATORDERLEVEL);
				var isRemainingQtyExists = 'F';
				
				if(FULFILLMENTATORDERLEVEL == 'Y' && opentaskSearchResults != null && opentaskSearchResults != '' && opentaskSearchResults != 'null' && opentaskSearchResults != undefined)
				{
					
					if(soInternalIds != '' && soInternalIds != null && soInternalIds != 'null' && soInternalIds != undefined && soInternalIds.length > 0)
						var soLineDetails = getSOLineDetailsNew2(soInternalIds,tranType,null,whLoc);					
					else if(soid != '' && soid != null && soid != 'null' && soid != undefined)
						var soLineDetails = getSOLineDetailsNew2(soid,tranType,null,whLoc);
					nlapiLogExecution('DEBUG', 'soLineDetails', soLineDetails);
					if(soLineDetails !=null && soLineDetails!="")
					{
						var vLinecount=0;
						nlapiLogExecution('DEBUG', 'soLineDetails.length', soLineDetails.length);
						if(soLineDetails.length>0)
						{
							var vColumnslist=soLineDetails[0].getAllColumns();
							
							var custIndex = 12;
							var commitedQtyIndex = 25;
							var fulfilledQtyIndex = 26;
							var conversionRateIndex=27;
							var totalPickedQtyIndex =7;
							var unitsIndex = 24;
							var totalNSPickedQtyIndex =37;
							var ERPConfirmedQty =38;
							for(var x1=0;x1<vColumnslist.length;x1++)
							{
								var summaryLabel = vColumnslist[x1].getLabel();
								var name = vColumnslist[x1].getName();
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
								else if(name == 'unit')
								{
									unitsIndex =x1;
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
							for(var f=0;f<soLineDetails.length;f++)
							{
								//	nlapiLogExecution('ERROR', 'soLineDetails.length', cnt);
								//var vsoitemRcvQty = soLineDetails[cnt].getValue('quantitypicked');
								//var vsoitemQty = soLineDetails[cnt].getValue('quantity');
								//var vColumnslist=soLineDetails[f].getAllColumns();
								var vsointernalid = soLineDetails[f].getValue('internalid',null,'group');
								var vsoitemRcvQty = soLineDetails[f].getValue('quantityshiprecv',null,'max');
								//var vsoitemCommitedQty=soLineDetails[f].getValue('quantitycommitted',null,'max');
								var vsoitemCommitedQty=soLineDetails[f].getValue(vColumnslist[commitedQtyIndex]);			 
								var vsoitemfulfillQty=soLineDetails[f].getValue(vColumnslist[fulfilledQtyIndex]);
								var vsoitemopentaskQty=soLineDetails[f].getValue(vColumnslist[totalPickedQtyIndex]);
								var vsoitemErpConfirmedQty=soLineDetails[f].getValue(vColumnslist[ERPConfirmedQty]);
								var vsoitemNSReceivedQty=soLineDetails[f].getValue(vColumnslist[totalNSPickedQtyIndex]);
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
								
								var vsoitemPickedQty = Number(vsoitemopentaskQty.plus(vsoitemErpConfirmedQty).plus((vsoitemNSReceivedQty).minus(vsoitemErpConfirmedQty)));
								
								//var vsoitemPickedQty = parseFloat(vsoitemopentaskQty)+parseFloat(vsoitemErpConfirmedQty)+(parseFloat(vsoitemNSReceivedQty)-parseFloat(vsoitemErpConfirmedQty));
								var vsoitemQty = soLineDetails[f].getValue('quantity',null,'max');
								var vsoitemLine = soLineDetails[f].getValue('line',null,'group');
								
								//var vsoitemRemQty=parseFloat(vsoitemCommitedQty)+ parseFloat(vsoitemfulfillQty) -parseFloat(vsoitemPickedQty);								
								vsoitemCommitedQty=Big(vsoitemCommitedQty);
								var vsoitemRemQty=Number((vsoitemCommitedQty).plus(vsoitemfulfillQty).minus(vsoitemPickedQty));
								nlapiLogExecution('DEBUG', 'vsoitemRemQty', vsoitemRemQty);
								if(parseFloat(vsoitemRemQty)>0)
								{									
									if(VSoremqtyArray.indexOf(vsointernalid) == -1)
									{
										VSoremqtyArray.push(vsointernalid);
									}
								}
							}
						}

					}
				}
				

				if(opentaskSearchResults!=null && opentaskSearchResults!='' && opentaskSearchResults.length>0)
				{
					form.addSubmitButton('Submit');
					nlapiLogExecution('DEBUG','opentaskSearchResults.length',opentaskSearchResults.length);
					form.addField('custpage_carton', 'text', 'Carton').setLayoutType('startrow','startcol').setMandatory(true);
					form.addField('custpage_cartonsize', 'text', 'Size').setDisplaySize(15);
					form.addField('custpage_cartonweight', 'text', 'Weight').setMandatory(true).setDisplaySize(15);
					var sublist = form.addSubList("custpage_packinglist", "list", "Multi-Order Packing");
					sublist.addField("custpage_select", "checkbox", "Confirm").setDefaultValue('T');
					sublist.addField("custpage_orderinternalid", "text", "Order InternalId").setDisplayType('hidden');
					sublist.addField("custpage_ordernumber", "text", "Transaction #");
					sublist.addField("custpage_locationname", "text", "Location");
					sublist.addField("custpage_container", "text", "Container #");	
					sublist.addField("custpage_sku", "text", "SKU ");
					sublist.addField("custpage_skuinternalid", "text", "SKU InternalId").setDisplayType('hidden');
					sublist.addField("custpage_parentsku", "text", "SKU ").setDisplayType('hidden');
					sublist.addField("custpage_parentskuinternalid", "text", "SKU InternalId").setDisplayType('hidden');
					sublist.addField("custpage_lineno", "text", "Line No ");
					sublist.addField("custpage_actqty", "text", "Quantity").setDisplayType('entry').setDisplaySize(15);
					sublist.addField("custpage_units", "text", "Units").setDisplaySize(15);
					sublist.addField("custpage_actqtyhddn", "text", "Quantity").setDisplayType('hidden');
					sublist.addField("custpage_expqtyhddn", "text", "Quantity").setDisplayType('hidden');
					sublist.addField("custpage_locationhddn", "text", "Location").setDisplayType('hidden');
					sublist.addField("custpage_checkflaghddn", "checkbox", "checkFlag").setDisplayType('hidden');
					sublist.addField("custpage_customers", "text", "customer").setDisplayType('hidden');
					sublist.addField("custpage_shipmethod", "text", "Ship Method Id").setDisplayType('hidden');
					sublist.addField("custpage_shipgroup", "text", "Ship group").setDisplayType('hidden');
					sublist.addField("custpage_vsoremqtyarray", "text", "Remaining Quantity").setDisplayType('hidden');
					sublist.addField("custpage_shipmethodtext", "text", "Ship Method");
					sublist.addMarkAllButtons();
					nlapiLogExecution('DEBUG', 'VSoremqtyArray', VSoremqtyArray);
					for(var i=0;i<opentaskSearchResults.length;i++)
					{
						var count=parseInt(i)+1;
						BindSublist(form,opentaskSearchResults[i],count,getSOid,soid,Shiparray,i,VSoremqtyArray);
					}
					opentaskSearchResults=null;
					filters=null;
					columns=null;
				}				
				else{

					msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', 'All the items for the selected criteria  are either packed/not yet picked.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");	
					response.writePage(form);
					return;
				}

				SORec=null;				
				SORecinternalids=null;
				response.writePage(form);

			}
			catch (e)  {
				SOarray["custparam_error"] = e;
				nlapiLogExecution('ERROR', 'exception in packing',e);
				msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', '"+e+"', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
				response.writePage(form);
			} finally {					
				nlapiLogExecution('DEBUG', 'finally','block');				
			}
		}
	}
}
/**
 * To bin data to sublist
 * @param form
 * @param sublistData
 * @param sublistCount
 * @param Order
 * @param soInternalId
 */
function BindSublist(form,sublistData,sublistCount,Order,soInternalId,Shiparray,i,VSoremqtyArray)
{
	try {
		var ActQuantity=sublistData.getValue('formulanumeric',null,'SUM');
		var ExpQuantity=sublistData.getValue('custrecord_wmsse_expe_qty',null,'SUM');
		var linenum=sublistData.getValue('custrecord_wmsse_line_no',null,'group');
		var	itemid=sublistData.getText('custrecord_wmsse_sku',null,'group');
		var	iteminternalid=sublistData.getValue('custrecord_wmsse_sku',null,'group');
		var	vContainer=sublistData.getValue('custrecord_wmsse_container_lp_no',null,'group');
		var	Order=sublistData.getValue('number','custrecord_wmsse_order_no','group');
		var	soInternalId=sublistData.getValue('internalid','custrecord_wmsse_order_no','group');
		var vParentItemText = sublistData.getText('custrecord_wmsse_parent_sku_no',null,'group');
		var vParentItemInternalId = sublistData.getValue('custrecord_wmsse_parent_sku_no',null,'group');
		var vCustomer = sublistData.getValue('name','custrecord_wmsse_order_no','group');
		var vShipMethod = sublistData.getValue('custrecord_wmsse_shipmethod',null,'group');
		var vShipMethodText = sublistData.getText('custrecord_wmsse_shipmethod',null,'group');
		var vUnits = sublistData.getValue('custrecord_wmsse_uom',null,'group');
		var location = sublistData.getValue('custrecord_wmsse_wms_location',null,'group');
		var locationName = sublistData.getText('custrecord_wmsse_wms_location',null,'group');
		var checkFlaghddn = 'F';
		form.getSubList('custpage_packinglist').setLineItemValue('custpage_orderinternalid', sublistCount, 
				soInternalId);
		form.getSubList('custpage_packinglist').setLineItemValue('custpage_ordernumber', sublistCount, 
				Order);
		form.getSubList('custpage_packinglist').setLineItemValue('custpage_skuinternalid', sublistCount, 
				iteminternalid);
		form.getSubList('custpage_packinglist').setLineItemValue('custpage_sku', sublistCount, 
				itemid);
		form.getSubList('custpage_packinglist').setLineItemValue('custpage_lineno', sublistCount, 
				linenum);
		form.getSubList('custpage_packinglist').setLineItemValue('custpage_actqty', sublistCount, 
				ActQuantity);
		form.getSubList('custpage_packinglist').setLineItemValue('custpage_units', sublistCount, 
				vUnits);
		form.getSubList('custpage_packinglist').setLineItemValue('custpage_container', sublistCount, 
				vContainer);
		form.getSubList('custpage_packinglist').setLineItemValue('custpage_actqtyhddn', sublistCount, 
				ActQuantity);
		form.getSubList('custpage_packinglist').setLineItemValue('custpage_expqtyhddn', sublistCount, 
				ExpQuantity);
		
		form.getSubList('custpage_packinglist').setLineItemValue('custpage_locationhddn', sublistCount, 
				location);
		form.getSubList('custpage_packinglist').setLineItemValue('custpage_checkflaghddn', sublistCount,
				checkFlaghddn);
		
		form.getSubList('custpage_packinglist').setLineItemValue('custpage_parentskuinternalid', sublistCount, 
				vParentItemInternalId);
		form.getSubList('custpage_packinglist').setLineItemValue('custpage_parentsku', sublistCount, 
				vParentItemText);
		form.getSubList('custpage_packinglist').setLineItemValue('custpage_customers', sublistCount, 
				vCustomer);

		form.getSubList('custpage_packinglist').setLineItemValue('custpage_shipmethod', sublistCount, 
				vShipMethod);
		form.getSubList('custpage_packinglist').setLineItemValue('custpage_shipmethodtext', sublistCount, 
				vShipMethodText);

		nlapiLogExecution('DEBUG', 'soInternalId',soInternalId);
		if(VSoremqtyArray.indexOf(soInternalId) == -1)
		{
			form.getSubList('custpage_packinglist').setLineItemValue('custpage_vsoremqtyarray', sublistCount, 
			'F');
		}
		else
		{
			form.getSubList('custpage_packinglist').setLineItemValue('custpage_vsoremqtyarray', sublistCount, 
			'T');
		}
		form.getSubList('custpage_packinglist').setLineItemValue('custpage_locationname', sublistCount, 
				locationName);
		for(var k=0;k<=i;k++)
		{
		
			var SOshipline = Shiparray[k][1];
			var SOshipgroup = Shiparray[k][0];
			nlapiLogExecution('DEBUG', 'SOshipline',SOshipline);	
			
			if(k==i && linenum == SOshipline)
				{
				form.getSubList('custpage_packinglist').setLineItemValue('custpage_shipgroup', sublistCount, 
						SOshipgroup);
				}
		
		}

	}
	catch(exp)
	{
		nlapiLogExecution('DEBUG', 'exp',exp);		

	}	
}

function processSelectedContainers(request, response, form,msg){
	try
	{
		//var msg = form.addField('custpage_message', 'inlinehtml', null, null, null).setLayoutType('outside','startrow');	
		form.setScript('customscript_wmsse_bulk_packing_cl');
		var vNewCarton=request.getParameter('custpage_carton');
		var vNewCartonSize=request.getParameter('custpage_cartonsize');
		var vNewCartonWeight=request.getParameter('custpage_cartonweight');
		var vSoName=request.getParameter('custpage_order');
		var tranType =request.getParameter('custpage_trantype');
		var orderType =request.getParameter('custpage_ordertype');

		var VactualBeginTime = request.getParameter('custpage_actualbegintime');
		nlapiLogExecution('DEBUG','VactualBeginTimepost',VactualBeginTime);

		var lineCount = request.getLineItemCount('custpage_packinglist');
		nlapiLogExecution('DEBUG','linecount', lineCount);
		var getPickreportId = request.getParameter('custpage_pickrptno');
		var context = nlapiGetContext();		
		var currentUserID =  context.getUser();
		
		var tempFlag="F";
		//var Container='';
		//var soInternalId='';
		//var soName='';
		//var soName='';
		//var skuInternalId='';
		var whLoc='';//case# 201412187
		var vCustomer="";
		var vCustmerArr = new Array();
		var vShipMethod="";
		var vShipMethodArr = new Array();
		var vShipGroup="";		
		var vShipGroupArr = new Array();
		for(var v = 1; v <= lineCount; v++){
			var customer= request.getLineItemValue('custpage_packinglist','custpage_customers', v);
			var shipmethod= request.getLineItemValue('custpage_packinglist','custpage_shipmethod', v);
			var isRowSelected= request.getLineItemValue('custpage_packinglist', 'custpage_select', v);
			var shipgroup= request.getLineItemValue('custpage_packinglist','custpage_shipgroup', v);
			if(isRowSelected=="T" )
			{
				

				if(customer != '' && customer != null && customer != 'null' && customer !='undefined' &&  vCustmerArr.indexOf(customer)==-1)
				{
					vCustmerArr.push(customer);
				}
				if(shipmethod != '' && shipmethod != null && shipmethod != 'null' && shipmethod !='undefined' &&  vShipMethodArr.indexOf(shipmethod)==-1)
				{
					vShipMethodArr.push(shipmethod);
				}
				
				if(shipgroup != '' && shipgroup != null && shipgroup != 'null' && shipgroup !='undefined' &&  vShipGroupArr.indexOf(shipgroup)==-1)
				{
					vShipGroupArr.push(shipgroup);
				}

			}
		}
		nlapiLogExecution('DEBUG','vCustmerArr.length', vCustmerArr);
		nlapiLogExecution('DEBUG','vShipMethodArr', vShipMethodArr);
		var kitTempFlag="F";
		var vPreviousParentItemId='';
		var vPreviousParentItemLineNO='';
		var vPrevSoId='';
		for(var s = 1; s <= lineCount; s++){
			var isRowSelected= request.getLineItemValue('custpage_packinglist', 'custpage_select', s);
			var isSameOrdExist='F';
			if(isRowSelected=="T" && vCustmerArr.length <= 1 && vShipMethodArr.length <= 1 && vShipGroupArr.length <= 1)
			{

				var soName = request.getLineItemValue('custpage_packinglist', 'custpage_ordernumber', s);
				var blnIsItLasttask='F';
				/*if(s == lineCount)
				{
					blnIsItLasttask='T';
				}*/	
				if(s <= lineCount)
				{
					var isNextRowSelected='F';
					for(var n=s+1;n<=lineCount; n++)
					{	
						isNextRowSelected= request.getLineItemValue('custpage_packinglist', 'custpage_select', n);
						if(isNextRowSelected == 'T')
						{	
							var vNextSelSOName = request.getLineItemValue('custpage_packinglist', 'custpage_ordernumber', n);
							nlapiLogExecution('DEBUG','vNextSelSOName,soName',vNextSelSOName+","+soName);
							/*if(vNextSelSOName != soName)
							{	
								blnIsItLasttask='T';
							vNextSelSOName="";
							break;
							}*/
							if(vNextSelSOName == soName)
							{
								isSameOrdExist='T';
							}	
						}
					}
					if(isSameOrdExist =='F')
						blnIsItLasttask='T';
					/*nlapiLogExecution('ERROR','blnIsItLasttask',blnIsItLasttask);
					nlapiLogExecution('ERROR','s',s);
					nlapiLogExecution('ERROR','lineCount',lineCount);
					if(blnIsItLasttask == "F" && parseFloat(s) == parseFloat(lineCount))
						blnIsItLasttask='T';*/
				}

				nlapiLogExecution('DEBUG','blnIsItLasttask after',blnIsItLasttask);

				var soInternalId= request.getLineItemValue('custpage_packinglist', 'custpage_orderinternalid', s);
				var skuName = request.getLineItemValue('custpage_packinglist', 'custpage_sku', s);
				var skuInternalId = request.getLineItemValue('custpage_packinglist', 'custpage_skuinternalid', s);
				var lineNo = request.getLineItemValue('custpage_packinglist', 'custpage_lineno', s);
				var actQty = request.getLineItemValue('custpage_packinglist', 'custpage_actqty', s);
				var containerNo = request.getLineItemValue('custpage_packinglist', 'custpage_container', s);
				var actqtyHddn = request.getLineItemValue('custpage_packinglist','custpage_actqtyhddn',s);
				var locationhddn = request.getLineItemValue('custpage_packinglist','custpage_locationhddn',s);
				var checkFlaghddn = request.getLineItemValue('custpage_packinglist','custpage_checkflaghddn',s);
				vShipMethod = request.getLineItemValue('custpage_packinglist','custpage_shipmethod',s);
				vShipGroup = request.getLineItemValue('custpage_packinglist','custpage_shipgroup',s);
				
				var opentaskSearchResults=new Array();
				var OTsearchresult = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_opentaskdetails_srh');
				
				OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['8']));
				OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_act_end_date', null, 'isnotempty'));
				OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof',['@NONE@'])); 
				OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_actendloc', null, 'isnotempty'));
				OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', soInternalId));
				OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3']));
				if(containerNo!=null && containerNo!='' && containerNo != '- None -')
					OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null, 'is', containerNo));
				if(lineNo!=null && lineNo!='')
					OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', lineNo));
				
				if(locationhddn!='' && locationhddn!=null && locationhddn!='null')
				{
					OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', locationhddn));
				}
				var resLenDetails = OTsearchresult.runSearch();
				var resultsPage = resLenDetails.getResults(0, 1000);
				var offset = 0;
				while (!!resultsPage && resultsPage.length > 0) 
				{
					opentaskSearchResults = opentaskSearchResults.concat(resultsPage);
					offset += 1000;
					resultsPage = resLenDetails.getResults(offset, offset + 1000);
				}
				nlapiLogExecution('DEBUG','opentaskSearchResults at',opentaskSearchResults);
				var RecordId='';
				var remSerialNums='';
				
				var filters = new Array();
				filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['8']));
				filters.push(new nlobjSearchFilter('custrecord_wmsse_act_end_date', null, 'isnotempty'));
				filters.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof',['@NONE@'])); 
				filters.push(new nlobjSearchFilter('custrecord_wmsse_actendloc', null, 'isnotempty'));
				filters.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', soInternalId));
				filters.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['3']));
				if(containerNo!=null && containerNo!='' && containerNo != '- None -')
					filters.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null, 'is', containerNo));
				if(lineNo!=null && lineNo!='')
					filters.push(new nlobjSearchFilter('custrecord_wmsse_line_no', null, 'equalto', lineNo));
				
				if(locationhddn!='' && locationhddn!=null && locationhddn!='null')
				{
					filters.push(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', locationhddn));
				}
				var columns=new Array();
				columns[0]=new nlobjSearchColumn('custrecord_wmsse_sku');
				columns[1]=new nlobjSearchColumn('custrecord_wmsse_line_no');
				columns[2]=new nlobjSearchColumn('custrecord_wmsse_act_qty');
				columns[3]=new nlobjSearchColumn('custrecord_wmsse_wms_location');
				columns[4]=new nlobjSearchColumn('custrecord_wmsse_container_lp_no');
				columns[5]=new nlobjSearchColumn('custrecord_wmsse_container_size');
				columns[6]=new nlobjSearchColumn('custrecord_wmsse_containerweight');
				columns[7]=new nlobjSearchColumn('custrecord_wmsse_serial_no');
				columns[8]=new nlobjSearchColumn('custrecord_wmsse_customer');
				columns[9]=new nlobjSearchColumn('custrecord_wmsse_parent_sku_no');
				columns[10]=new nlobjSearchColumn('custrecord_wmsse_conversionrate');
				
				
				if(opentaskSearchResults!=null && opentaskSearchResults!='' && opentaskSearchResults.length >0)
				{
					if(vPrevSoId != soInternalId)
					{
						vPrevSoId =soInternalId;
						kitTempFlag="F";
					}
					var curQty =actQty;
					nlapiLogExecution('DEBUG','actQty', actQty);
					for(var z=0;z<opentaskSearchResults.length && parseFloat(curQty) > 0;z++)
					{
						nlapiLogExecution('DEBUG','opentaskSearchResults.length',opentaskSearchResults.length);
						tempFlag="T";
						RecordId=opentaskSearchResults[z].getId();
						var tactQty = opentaskSearchResults[z].getValue('custrecord_wmsse_act_qty');
						var tSku  = opentaskSearchResults[z].getValue('custrecord_wmsse_sku');
						var tLine = opentaskSearchResults[z].getValue('custrecord_wmsse_line_no');
						whLoc= opentaskSearchResults[z].getValue('custrecord_wmsse_wms_location');
						var tSerialNums = opentaskSearchResults[z].getValue('custrecord_wmsse_serial_no');
						vCustomer= opentaskSearchResults[z].getValue('custrecord_wmsse_customer');
						var tConversionRate = opentaskSearchResults[z].getValue('custrecord_wmsse_conversionrate');
						if(tConversionRate ==  '' || tConversionRate == 'null' || tConversionRate == null || tConversionRate == undefined || isNaN(tConversionRate))
						{
							tConversionRate = 1;
						}
						if((tSku ==  skuInternalId ) && ( tLine == lineNo))
						{
							var Qty = tactQty;
							var fields = new Array();
							var values = new Array();
							if(vNewCarton!=null && vNewCarton!='')
							{
								fields.push('custrecord_wmsse_container_lp_no');
								values.push(vNewCarton);
							}
							nlapiLogExecution('DEBUG', 'vNewCarton', vNewCarton);
							fields.push('custrecord_wmsse_wms_status_flag');
							values.push(28);
							fields.push('custrecord_wmsse_device_upload_flag');
							values.push('T');
							var vDate=DateStamp();
							var vTime=TimeStampNew();
							var vNewDate=vDate + ' ' + vTime;
							fields.push('custrecord_wmsse_pack_comp_date');
							values.push(vNewDate);
							if(vNewCartonSize!=null && vNewCartonSize!='')
							{
								fields.push('custrecord_wmsse_container_size');
								values.push(vNewCartonSize);
							}
							if(vNewCartonWeight!=null && vNewCartonWeight!='')
							{
								fields.push('custrecord_wmsse_containerweight');
								values.push(vNewCartonWeight);
							}
							if(parseFloat(tactQty) > parseFloat(curQty))
							{
								Qty = curQty;

								fields.push('custrecord_wmsse_act_qty');
								values.push(Qty);
								Qty = Number(Big(Qty).mul(tConversionRate));	
								//Qty = parseFloat((parseFloat(Qty)* parseFloat(tConversionRate)).toFixed(5));
								nlapiLogExecution('ERROR', 'first', Qty);
								if(tSerialNums!=null && tSerialNums!='' && tSerialNums!='- None -')
								{
									var totalSerialArray=tSerialNums.split(',');
									var actualSerial ='';
									var actSerialArray = new Array();
									for (var k = 0; k < Qty; k++) {
										if(actualSerial==null || actualSerial=='')
										{
											actualSerial=totalSerialArray[k];
										}
										else
										{
											actualSerial=actualSerial+","+totalSerialArray[k];
										}
										actSerialArray.push(totalSerialArray[k]);
									}
									fields.push('custrecord_wmsse_serial_no');
									values.push(actualSerial);

									for (var f = Qty; f < totalSerialArray.length; f++) {
										var remserialcheck = totalSerialArray[f];
										if(actSerialArray != null && actSerialArray != 'null' && actSerialArray != '' && actSerialArray.length > 0 && actSerialArray.indexOf(remserialcheck) == -1)
										{
											if(remSerialNums==null || remSerialNums=='')
											{
												remSerialNums=totalSerialArray[f];
											}
											else
											{
												remSerialNums=remSerialNums+","+totalSerialArray[f];
											}
										}
									}

								}
							}
							nlapiLogExecution('DEBUG', 'RecordId', RecordId);
							if(RecordId!=null && RecordId!='')
							{
								nlapiSubmitField('customrecord_wmsse_trn_opentask', RecordId,fields, values);

							}
							if(parseFloat(tactQty) > parseFloat(curQty))
							{
								//var remainQty = parseFloat(tactQty)-parseFloat(curQty);
								var remainQty = Number(Big(tactQty).minus(curQty));
								var createopentaskrec =  nlapiCopyRecord('customrecord_wmsse_trn_opentask',RecordId);		    	
								nlapiLogExecution('DEBUG', 'createopentaskrec', createopentaskrec);
								createopentaskrec.setFieldValue('custrecord_wmsse_wms_status_flag', '8');//Statusflag='C'
								createopentaskrec.setFieldValue('custrecord_wmsse_container_size', '');	
								createopentaskrec.setFieldValue('custrecord_wmsse_container_lp_no', '');	
								createopentaskrec.setFieldValue('custrecord_wmsse_act_qty', Number(Big(remainQty).toFixed(5)));
								createopentaskrec.setFieldValue('custrecord_wmsse_expe_qty', Number(Big(remainQty).toFixed(5)));
								createopentaskrec.setFieldValue('custrecord_wmsse_upd_user_no', currentUserID);
								createopentaskrec.setFieldValue('name',soName);
								createopentaskrec.setFieldValue('custrecord_wmsse_device_upload_flag','F');
								if(remSerialNums!=null && remSerialNums!='')
								{
									createopentaskrec.setFieldValue('custrecord_wmsse_serial_no', remSerialNums);
								}
								nlapiSubmitRecord(createopentaskrec);
								createopentaskrec=null;
							}
							//curQty = parseFloat(curQty)-parseFloat(Qty);
							curQty = Number(Big(curQty).minus(Qty));
						}

						
						var logMsg1 = 'actQty =' + actQty + '<br>';
						logMsg1 = logMsg1 + 'actqtyHddn = ' + actqtyHddn + '<br>';
						logMsg1 = logMsg1 + 'RecordId = ' + RecordId + '<br>';
						logMsg1 = logMsg1 + 'soName = ' + soName + '<br>';
						nlapiLogExecution('DEBUG', 'parameters', logMsg1);


						var vParentItemType = "";
						var vparentItemId = opentaskSearchResults[z].getValue('custrecord_wmsse_parent_sku_no');
						var vparentItemLocation = opentaskSearchResults[z].getValue('custrecord_wmsse_wms_location');
						if(vparentItemId != null && vparentItemId !='' && vparentItemId!= 'null')
						{
							vParentItemType = nswms_GetItemType(vparentItemId,vparentItemLocation);
						}
						nlapiLogExecution('DEBUG', 'vPreviousParentItemId', vPreviousParentItemId);
						nlapiLogExecution('DEBUG', 'vparentItemId', vparentItemId);
						if((vPreviousParentItemId != vparentItemId) || (vPreviousParentItemLineNO != tLine))
						{
							kitTempFlag ="F";
						}
					
						
						if(vParentItemType == 'kititem' && (kitTempFlag == "F") && ((vparentItemId != vPreviousParentItemId) || (vPreviousParentItemLineNO != tLine)))
						{
							filters.push(new nlobjSearchFilter('custrecord_wmsse_sku', null, 'anyof', vparentItemId));

							var openParenttaskSearchResults=nlapiSearchRecord('customrecord_wmsse_trn_opentask',null,filters,columns);

							if(openParenttaskSearchResults !=null && openParenttaskSearchResults!='' && openParenttaskSearchResults.length >0)
							{
								var vnRecId = openParenttaskSearchResults[0].getId();
								var vMainActQty = openParenttaskSearchResults[0].getValue('custrecord_wmsse_act_qty');
								var fields = new Array();
								var values = new Array();
								if(vNewCarton!=null && vNewCarton!='')
								{
									fields.push('custrecord_wmsse_container_lp_no');
									values.push(vNewCarton);
								}
								nlapiLogExecution('DEBUG', 'vNewCarton', vNewCarton);
								fields.push('custrecord_wmsse_wms_status_flag');
								values.push(28);
								//fields.push('custrecord_wmsse_device_upload_flag');
								//values.push('T');
								var vDate=DateStamp();
								var vTime=TimeStampNew();
								var vNewDate=vDate + ' ' + vTime;
								fields.push('custrecord_wmsse_pack_comp_date');
								values.push(vNewDate);
								if(vNewCartonSize!=null && vNewCartonSize!='')
								{
									fields.push('custrecord_wmsse_container_size');
									values.push(vNewCartonSize);
								}
								if(vNewCartonWeight!=null && vNewCartonWeight!='')
								{
									fields.push('custrecord_wmsse_containerweight');
									values.push(vNewCartonWeight);
								}
								if(actqtyHddn != actQty)
								{
									var vMainItemQty = fnGetKitItemQty(vparentItemId,actQty);
									nlapiLogExecution('DEBUG', 'vMainItemQty', vMainItemQty);
									fields.push('custrecord_wmsse_act_qty');
									values.push(Number(Big(vMainItemQty).toFixed(5)));
								}
								if(vnRecId!=null && vnRecId!='')
								{
									nlapiSubmitField('customrecord_wmsse_trn_opentask', vnRecId,fields, values);

								}
								kitTempFlag ="T";
								vPreviousParentItemId = vparentItemId;
								vPreviousParentItemLineNO = tLine;

								//if(actqtyHddn != actQty && (kitTempFlag == "F"))
								if(actqtyHddn != actQty)
								{
									//kitTempFlag ="T";
									//var remainQty = parseFloat(vMainActQty)-parseFloat(vMainItemQty);
									var remainQty = Number(Big(vMainActQty).minus(vMainItemQty));
									var createopentaskrec =  nlapiCopyRecord('customrecord_wmsse_trn_opentask',vnRecId);		    	
									nlapiLogExecution('DEBUG', 'createopentaskrec kit', createopentaskrec);
									createopentaskrec.setFieldValue('custrecord_wmsse_wms_status_flag', '8');//Statusflag='C'
									createopentaskrec.setFieldValue('custrecord_wmsse_container_size', '');	
									createopentaskrec.setFieldValue('custrecord_wmsse_container_lp_no', '');	
									createopentaskrec.setFieldValue('custrecord_wmsse_act_qty', Number(Big(remainQty).toFixed(5)));
									createopentaskrec.setFieldValue('custrecord_wmsse_expe_qty', Number(Big(remainQty).toFixed(5)));
									createopentaskrec.setFieldValue('custrecord_wmsse_upd_user_no', currentUserID);
									createopentaskrec.setFieldValue('name',soName);
									createopentaskrec.setFieldValue('custrecord_wmsse_device_upload_flag','F');
									nlapiSubmitRecord(createopentaskrec);
									createopentaskrec=null;
								}
							}
						}
					}					
					remSerialNums=null;
					totalSerialArray=null;
				}
				opentaskSearchResults=null;
				if(blnIsItLasttask=='T' && tempFlag=="T")
				{

					var isItLastPick="T";
					var FULFILLMENTATORDERLEVEL=getSystemRuleValue('Consolidate item fulfillments by sales order?',whLoc);
					if(FULFILLMENTATORDERLEVEL =='Y')
					{
						var soLineDetails = getSOLineDetailsNew(vSoName,tranType,null,whLoc);
						nlapiLogExecution('DEBUG', 'soLineDetails', soLineDetails);
						if(soLineDetails !=null && soLineDetails!="")
						{
							var vLinecount=0;
							nlapiLogExecution('DEBUG', 'soLineDetails.length', soLineDetails.length);
							if(soLineDetails.length>0)
							{
								var vColumnslist=soLineDetails[0].getAllColumns();
								var custIndex = 12;
								var commitedQtyIndex = 25;
								var fulfilledQtyIndex = 26;
								var conversionRateIndex=27;
								var totalPickedQtyIndex =7;
								var unitsIndex = 24;
								var totalNSPickedQtyIndex =37;
								var ERPConfirmedQty =38;
								for(var x1=0;x1<vColumnslist.length;x1++)
								{
									var summaryLabel = vColumnslist[x1].getLabel();
									var name = vColumnslist[x1].getName();
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
									else if(name == 'unit')
									{
										unitsIndex =x1;
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
								for(var f=0;f<soLineDetails.length;f++)
								{
									
									var vColumnslist=soLineDetails[f].getAllColumns();
									var vsoitemRcvQty = soLineDetails[f].getValue('quantityshiprecv',null,'max');
									//var vsoitemCommitedQty=soLineDetails[f].getValue('quantitycommitted',null,'max');
									var vsoitemCommitedQty=soLineDetails[f].getValue(vColumnslist[commitedQtyIndex]);			 
									var vsoitemfulfillQty=soLineDetails[f].getValue(vColumnslist[fulfilledQtyIndex]);
									var vsoitemopentaskQty=soLineDetails[f].getValue(vColumnslist[totalPickedQtyIndex]);
									var vsoitemErpConfirmedQty=soLineDetails[f].getValue(vColumnslist[ERPConfirmedQty]);
									var vsoitemNSReceivedQty=soLineDetails[f].getValue(vColumnslist[totalNSPickedQtyIndex]);
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

									//var vsoitemPickedQty = parseFloat(vsoitemopentaskQty)+parseFloat(vsoitemErpConfirmedQty)+(parseFloat(vsoitemNSReceivedQty)-parseFloat(vsoitemErpConfirmedQty));
									
									vsoitemopentaskQty=new Big(vsoitemopentaskQty);
									vsoitemErpConfirmedQty=new Big(vsoitemErpConfirmedQty);
									vsoitemNSReceivedQty=new Big(vsoitemNSReceivedQty);
									
									var vsoitemPickedQty = Number(vsoitemopentaskQty.plus(vsoitemErpConfirmedQty).plus((vsoitemNSReceivedQty).minus(vsoitemErpConfirmedQty)));
									
									var vsoitemQty = soLineDetails[f].getValue('quantity',null,'max');
									var vsoitemLine = soLineDetails[f].getValue('line',null,'group');
									
									vsoitemCommitedQty=new Big(vsoitemCommitedQty);
									var vsoitemRemQty=Number((vsoitemCommitedQty).plus(vsoitemfulfillQty).minus(vsoitemPickedQty));
									//var vsoitemRemQty=parseFloat(vsoitemCommitedQty)+ parseFloat(vsoitemfulfillQty) -parseFloat(vsoitemPickedQty);
									nlapiLogExecution('DEBUG', 'vsoitemRemQty', vsoitemRemQty);
									if(parseFloat(vsoitemRemQty)>0)
									{
										vLinecount=parseFloat(vLinecount)+1;
									}
								}
							}
							if(parseFloat(vLinecount)>=1)
							{
								isItLastPick="F";
							}
							else
							{
								isItLastPick="T";
							}
						}
					}
					

					var customrecord = nlapiCreateRecord('customrecord_wmsse_trn_opentask');

					if(vNewCarton!=null && vNewCarton!='')
						customrecord.setFieldValue('custrecord_wmsse_container_lp_no', vNewCarton);
					if(vNewCartonSize!=null && vNewCartonSize!='')	
						customrecord.setFieldValue('custrecord_wmsse_container_size', vNewCartonSize);
					if(vNewCartonWeight!=null && vNewCartonWeight!='')
						customrecord.setFieldValue('custrecord_wmsse_containerweight', vNewCartonWeight);
					if(getPickreportId!=null && getPickreportId!='')
						customrecord.setFieldValue('custrecord_wmsse_pickreport_no', getPickreportId);

					customrecord.setFieldValue('custrecord_wmsse_wms_location', whLoc);
					customrecord.setFieldValue('custrecord_wmsse_order_no', soInternalId);

					customrecord.setFieldValue('custrecord_wmsse_wms_status_flag', 28);//Packing completed
					customrecord.setFieldValue('custrecord_wmsse_tasktype', 14);
					//customrecord.setFieldValue('custrecord_wmsse_device_upload_flag','T');
					if(isItLastPick == "F")
					{
						nlapiLogExecution('DEBUG', 'checkFlaghddn',checkFlaghddn);
						if(checkFlaghddn != "T")
							customrecord.setFieldValue('custrecord_wmsse_device_upload_flag','F');					
						else
							customrecord.setFieldValue('custrecord_wmsse_device_upload_flag','T');
					}
					else
						customrecord.setFieldValue('custrecord_wmsse_device_upload_flag','T');
					customrecord.setFieldValue('custrecord_wmsse_act_begin_date', DateStamp());
					customrecord.setFieldValue('custrecord_wmsse_act_end_date', DateStamp());
					if(vCustomer != null && vCustomer != '')
						customrecord.setFieldValue('custrecord_wmsse_customer', vCustomer);

					if(vShipMethod != null && vShipMethod !='' && vShipMethod !='null' && vShipMethod !='undefined')
						customrecord.setFieldValue('custrecord_wmsse_shipmethod', vShipMethod);

					if(orderType != null && orderType !='' && orderType !='null' && orderType !='undefined')
						customrecord.setFieldValue('custrecord_wmsse_ord_type', orderType);

					var VactualEndTime=TimeStamp();
					if(VactualBeginTime != null && VactualBeginTime != '')
						customrecord.setFieldValue('custrecord_wmsse_actualbegintime', VactualBeginTime);
					customrecord.setFieldValue('custrecord_wmsse_actualendtime', VactualEndTime);

					var vDate=DateStamp();
					var vTime=TimeStampNew();
					var vNewDate=vDate + ' ' + vTime;
					customrecord.setFieldValue('custrecord_wmsse_pack_comp_date', vNewDate);
					nlapiLogExecution('DEBUG', 'vSoName2',soName);
					customrecord.setFieldValue('name', soName);
					var recid = nlapiSubmitRecord(customrecord);
					customrecord=null;
					nlapiLogExecution('DEBUG', 'Item Fulfillment posted successfully','');
					//form.addButton('custpage_generatesearch','New Order','backtogeneratesearch()');
					//var st1='Order  ' + vSoName + '  Packed successfully';



				}	
			}
		}
		if(vCustmerArr.length > 1)
		{
			var st1="Multi Order packing should be allowed for same customer";
			msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', '"+st1+"', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
			response.writePage(form);
		}
		else if(vShipMethodArr.length > 1  || vShipGroupArr.length > 1)
		{
			var st1="Multi Order packing should be allowed for same ship method/shipping address";
			msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', '"+st1+"', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
			response.writePage(form);
		}
		else if(tempFlag=="F")
		{
			var errform = nlapiCreateForm('Packing');
			
			var msg = errform.addField('custpage_message', 'inlinehtml', null, null, null).setLayoutType('outside','startrow');
			//var st1="Please Select Atleast One Line Item.";
			var st1="All the items in the order are already packed/not yet picked.";
			nlapiLogExecution('DEBUG', 'No Line item Selected','');
			//form.addButton('custpage_generatesearch','New Order','backtogeneratesearch()');
			msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', '"+st1+"', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
			errform.addButton('custpage_errgeneratesearch','New Order','backtogeneratesearch()');
			errform.setScript('customscript_wmsse_packing_cl');
			response.writePage(errform);
		}		
		else
		{
			var vnform = nlapiCreateForm('Multi-Order Packing');
			var vnmsg = vnform.addField('custpage_message', 'inlinehtml', null, null, null).setLayoutType('outside','startrow');		  
			vnform.addButton('custpage_generatesearch','New Order','backtogeneratesearch()');
			vnform.setScript('customscript_wmsse_bulk_packing_cl');
			var st1='Packed successfully' ;

			if(vNewCarton != null && vNewCarton != '')
				//st1 = 'Carton# ' + vNewCarton + " " + st1; 
				st1 = "SO/TO "+vSoName+" with containerlp(s) "+vNewCarton+" packed successfully";
			vnmsg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Confirmation', '"+st1+"', NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null, null, null);</script></div>");
			var htmlstring="";
			//htmlstring=Htmlparameters["strVar"];
			htmlstring="packing completed";
			//htmlstring=gethtmlstringbyLp(newContainerLpNo);
			nlapiLogExecution('DEBUG', 'Htmlstring is:',htmlstring);		

			var temphtmlstring= vnform.addField('custpage_temphtmlstring', 'longtext', 'temphtmlstring').setDisplayType('hidden');
			temphtmlstring.setDefaultValue(htmlstring);			
			var tempsoid= vnform.addField('custpage_soid', 'text', 'soInternalId').setDisplayType('hidden');
			tempsoid.setDefaultValue(soInternalId);
			var tempcontlp= vnform.addField('custpage_contlp', 'text', 'contlp').setDisplayType('hidden');
			tempcontlp.setDefaultValue(vNewCarton);	
			nlapiLogExecution('ERROR', 'temphtmlstring:',temphtmlstring);
			
			vnform.addButton('custpage_print','Print Packlist','PrintPacklist()');
			response.writePage(vnform);
		}	
	}
	catch(e)
	{
		nlapiLogExecution('ERROR', 'Error in processing',e);
	}

}
/**
 * To redirect back to process new order
 */
function backtogeneratesearch()
{ 	 
	var PackingURL = nlapiResolveURL('SUITELET', 'customscript_wmsse_gui_bulk_packing', 'customdeploy_wmsse_gui_bulk_packing');

	window.location.href = PackingURL;
}


/**
 * Generic function to display different types of inline messages with 1 dynamic operational variable/quantity
 * @param messageType
 * @param messageHeader
 * @param messageText
 */
function showInlineMessage(form, messageType, messageText, messageVariable){
	var msg;
	var priority;

	// Create the message field in the form
	msg = form.addField('custpage_message', 'inlinehtml', null, null, null);

	if(messageType == 'Confirmation')
		priority = 'NLAlertDialog.TYPE_LOWEST_PRIORITY';
	else if(messageType == 'ERROR')
		priority = 'NLAlertDialog.TYPE_HIGH_PRIORITY';
	else
		priority = 'NLAlertDialog.TYPE_HIGH_PRIORITY';

	// Set the message value
	if(messageVariable != null)
		msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', '" +
				messageType + "', '" + messageText + ":" + messageVariable + "', " +
				priority + ",  '100%', null, null, null);</script></div>");
	else
		msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', '" +
				messageType + "', '" + messageText + "', " +
				priority + ",  '100%', null, null, null);</script></div>");
}


/**
 * To validate container LP
 */
function validateContLp(newcontLp)
{
	var isValid='T';
	var opentaskSearchResults=new Array();
	var OTsearchresult = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_opentaskdetails_srh');
		
	OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null, 'is', newcontLp));
	OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['14']));
	var resLenDetails = OTsearchresult.runSearch();
	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) 
	{
		opentaskSearchResults = opentaskSearchResults.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}
	
	if(opentaskSearchResults != null && opentaskSearchResults != '' && opentaskSearchResults.length > 0)
	{
		isValid='F'; 
	}
	nlapiLogExecution('Debug', 'isValid',isValid);
	opentaskSearchResults=null;
	return  isValid;
}


//function to retrieve the printer names
function getAllprinternames(){

	var colsWorkstation = new Array();
//	colsSO[0] = new nlobjSearchColumn('name');
	colsWorkstation[0] = new nlobjSearchColumn('custrecord_wmsse_printer_printername',null, 'group');
	var searchresults = nlapiSearchRecord('customrecord_wmsse_printer_preferences', null, null, colsWorkstation);

	return searchresults;
}
//Add printer name
function addAllPrinterNamesToField(form,selectprintername, printernameList){
	if(printernameList!=null && printernameList!='')
	{

		if(printernameList != null && printernameList.length > 0){
			for (var i = 0; i < printernameList.length; i++) 
			{			
				selectprintername.addSelectOption(printernameList[i].getValue('custrecord_wmsse_printer_printername',null,'group'), printernameList[i].getValue('custrecord_wmsse_printer_printername',null,'group'));
			}
		}
	}
}
//201412825
function PrintPacklist()
{
	var htmlstring=nlapiGetFieldValue('custpage_temphtmlstring');	
	//var imgurl=nlapiGetFieldValue('custpage_tempimgurl');	
	if((htmlstring!=null && htmlstring!=''))
	{
		var soid=nlapiGetFieldValue('custpage_soid');
		var containerlp=nlapiGetFieldValue('custpage_contlp');
		var bulkpack='YES';
		var WavePDFURL = nlapiResolveURL('SUITELET', 'customscript_wmsse_pack_list_print', 'customdeploy_wmsse_pack_list_print');
		WavePDFURL = WavePDFURL + '&custparam_wmsse_soid='+ soid + '&custparam_wmsse_containerlp='+ containerlp+ '&custparam_bul_pack='+ bulkpack;
		var printWindow=window.open(WavePDFURL);
		printWindow.focus();
		printWindow.print();
	}
}
function funtoCheckPickReportNo(pickreportid,loc){

	nlapiLogExecution('DEBUG', 'pickreportid', pickreportid);

	var SORecinternalids=new Array();
	var OTsearchresult = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_opentaskdetails_srh');
	
	OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_pickreport_no',null,'is',pickreportid));
	OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag',null,'anyof',['9']));

	if(loc!=null && loc!="" && loc!='null')
		OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', loc));

	var resLenDetails = OTsearchresult.runSearch();
	var resultsPage = resLenDetails.getResults(0, 1000);
	var offset = 0;
	while (!!resultsPage && resultsPage.length > 0) 
	{
		SORecinternalids = SORecinternalids.concat(resultsPage);
		offset += 1000;
		resultsPage = resLenDetails.getResults(offset, offset + 1000);
	}

	return SORecinternalids;
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


function onSave(type,name)
{
	var cartonNo = nlapiGetFieldValue('custpage_carton');
	var cartonWeight = nlapiGetFieldValue('custpage_cartonweight');

	if(cartonNo==null || cartonNo=='')
	{
		alert('Please enter value(s) for: Carton');
		return false;
	}
	
	if(cartonNo !=null && cartonNo !='' && cartonNo !=null && cartonNo !='')
	{
		//var newcartonNo = cartonNo.replace(/[^a-zA-Z0-9]/g, "");
		var newcartonNo = cartonNo.replace(/[';:!%&#@,<>]/g, "");

		if(newcartonNo.length != cartonNo.length)
		{
			//alert('Please enter valid value(s) for: Carton');
			alert('Carton numbers cannot contain the following special characters: ! ; %  : & # , @ < >');
			return false;
		}
	}
	
	if(cartonWeight==null || cartonWeight=='')
	{
		alert('Please enter value(s) for: Carton weight');
		return false;
	}

	if(isNaN(cartonWeight)==true)
	{
		//alert('Please enter valid carton weight');
		alert('Please enter numeric value(s) for: carton weight');
		return false;
	}

	if(parseFloat(cartonWeight)<0)
	{
		//alert('Please enter valid carton weight');
		alert('Carton weight should not be negative value');
		return false;
	}
	if(parseFloat(cartonWeight) == 0)
	{
		alert('Carton weight should be greater than zero');
		return false;
	}
	var maxvalue =  Math.pow(2,64);
	if(parseFloat(cartonWeight) > parseFloat(maxvalue))
	{
		alert("Illegal Carton weight: " + cartonWeight);
		return false;
	}	
	var tempFlag="F";

	var lineCnt = nlapiGetLineItemCount('custpage_packinglist');
	var vCustmerArr = new Array();
	var confirmFulfillment = false;
	var checkflag = 'F';
	for(var p=1;p<=lineCnt;p++)
	{
		var isSelected=nlapiGetLineItemValue('custpage_packinglist', 'custpage_select', p);
		var orderId=nlapiGetLineItemValue('custpage_packinglist', 'custpage_orderinternalid', p);
		var enteredQty=nlapiGetLineItemValue('custpage_packinglist', 'custpage_actqty', p);
		var expQty=nlapiGetLineItemValue('custpage_packinglist', 'custpage_expqtyhddn', p);
		var actQty=nlapiGetLineItemValue('custpage_packinglist', 'custpage_actqtyhddn', p);
		var whLoc=nlapiGetLineItemValue('custpage_packinglist', 'custpage_locationhddn', p);
		var customer=nlapiGetLineItemValue('custpage_packinglist','custpage_customers', p);
		var checkFlaghddn=nlapiGetLineItemValue('custpage_packinglist', 'custpage_checkflaghddn', p);
		var isRemainingQtyExists=nlapiGetLineItemValue('custpage_packinglist', 'custpage_vsoremqtyarray', p);
		
		if(expQty == null || expQty == 'null' || expQty == '' || expQty == undefined)
		{			
		expQty = '0';
		}
		
		if(isSelected=="T")
		{

			tempFlag="T";
			if(isNaN(enteredQty) || parseFloat(enteredQty)<=0)
			{
				alert('Please enter valid qty');
				nlapiSetLineItemValue('custpage_packinglist', 'custpage_actqty', p,actQty);
				return false;
			}
			if(parseFloat(enteredQty) > parseFloat(actQty))
			{
				alert('Pack qty should be less than or equal to Pick Qty');
				nlapiSetLineItemValue('custpage_packinglist', 'custpage_actqty', p,actQty);
				return false;
			}
			
			
			if(parseFloat(enteredQty) != parseFloat(actQty) || isRemainingQtyExists == 'T')
			{								
				var FULFILLMENTATORDERLEVEL = getSystemRuleValue('Consolidate item fulfillments by sales order?',whLoc);


				if(FULFILLMENTATORDERLEVEL =='Y')
				{
					if(checkflag == 'F')
						confirmFulfillment = confirm("Do you wish to fulfill this/these order(s) with partial quantity");

					if(confirmFulfillment == true)
					{		
						checkflag = 'T';
						//nlapiSetLineItemValue('custpage_packinglist', 'custpage_checkFlaghddn',checkFlaghddn);
						nlapiSetLineItemValue('custpage_packinglist', 'custpage_checkflaghddn', p,'T');
												
						var opentaskSearchResultsPack=new Array();
						var OTsearchresult = new nlapiLoadSearch('customrecord_wmsse_trn_opentask', 'customsearch_wmsse_opentaskdetails_srh');
						
						OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['28']));
						OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof',['@NONE@'])); 
						OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', orderId));
						OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['14']));
						OTsearchresult.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', whLoc));

						var resLenDetails = OTsearchresult.runSearch();
						var resultsPage = resLenDetails.getResults(0, 1000);
						var offset = 0;
						while (!!resultsPage && resultsPage.length > 0) 
						{
							opentaskSearchResultsPack = opentaskSearchResultsPack.concat(resultsPage);
							offset += 1000;
							resultsPage = resLenDetails.getResults(offset, offset + 1000);
						}

						if(opentaskSearchResultsPack!=null && opentaskSearchResultsPack!='')
						{


							var fieldsPack = new Array();
							var valuesPack = new Array();
							for(var x=0; x < opentaskSearchResultsPack.length; x++)
							{

								var RecordIdPack=opentaskSearchResultsPack[x].getId();
								if(RecordIdPack!=null && RecordIdPack!='')
								{
									var recId=nlapiLoadRecord('customrecord_wmsse_trn_opentask',RecordIdPack);
									recId.setFieldValue('custrecord_wmsse_device_upload_flag','T');
									var vPackRecId = nlapiSubmitRecord(recId);
									nlapiLogExecution('DEBUG','vPackRecId at',vPackRecId);
								}
							}
						}							
					}
					else
						return false;
				}
			}
			
			
		}
	}

	if(tempFlag=="F")
	{
		alert('Please Select Atleast One Line Item');
		return false;
	}
	if(vCustmerArr.length > 1)
	{
		alert("Please Select Unique customer.");
		return false;
	}
	return true;	
}

function fnGetKitItemQty(getItemInternalId,actQty)
{
	var filters = new Array(); 

	filters[0] = new nlobjSearchFilter('internalid', null, 'is', getItemInternalId);//kit_id is the parameter name 
	var columns1 = new Array(); 
	columns1[0] = new nlobjSearchColumn( 'memberitem' ); 
	columns1[1] = new nlobjSearchColumn( 'memberquantity' );
	columns1[2] = new nlobjSearchColumn('type','memberitem');
	var searchresults = nlapiSearchRecord( 'item', 'customsearch_wmsse_inv_basic_itemdetails', filters, columns1 );  
	var kititemsarr = new Array();
	for(var q=0; searchresults!=null && q<searchresults.length;q++) 
	{
		var vMemItemType=searchresults[q].getValue('type','memberitem');
		if(vMemItemType =='Assembly' || vMemItemType =='InvtPart')
		{
			var vSubArr=new Array();
			vSubArr.push(searchresults[q].getText('memberitem'));
			var vMemQty=searchresults[q].getValue('memberquantity');
			if(vMemQty == null || vMemQty == '')
				vMemQty=0;
			//var cuurRow=[searchresults[q].getValue('memberitem'),vMemQty];
			//kititemsarr.push(cuurRow);
			//var vKitQty=actQty/vMemQty;
			actQty = Big(actQty);		
			var vKitQty = Number(actQty.div(vMemQty)); 
		}
	}
	searchresults=null;
	filters=null;
	columns1=null;
	return vKitQty;
}

function getSystemRuleValue(RuleId,loc)
{
	nlapiLogExecution('Debug', 'Into getSystemRuleValue... ', RuleId);
	nlapiLogExecution('Debug', 'loc', loc);
	var systemrulevalue='';

	try{
		var filters = new Array();

		filters[0] = new nlobjSearchFilter('name', null, 'is', RuleId.toString());
		filters[1] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
		//starts
		if(loc != null && loc != '')
			filters.push(new nlobjSearchFilter('custrecord_wmssesite', null, 'anyof', ['@NONE@',loc]));
		//ends

		var columns = new Array();
		columns[0] = new nlobjSearchColumn('custrecord_wmsserulevalue');
		columns[1] = new nlobjSearchColumn('custrecord_wmssesite');

		columns[1].setSort();
		var searchresults = nlapiSearchRecord('customrecord_wmsse_sysrules', null, filters, columns);	
		if(searchresults != null && searchresults != '')
		{
			if(searchresults[0].getValue('custrecord_wmsserulevalue') != null && searchresults[0].getValue('custrecord_wmsserulevalue') != '')
			{
				systemrulevalue = searchresults[0].getValue('custrecord_wmsserulevalue');
				searchresults=null;
				return systemrulevalue;
			}
			else
				return systemrulevalue;
		}
		else
			return systemrulevalue;
	}
	catch (exp) 
	{
		nlapiLogExecution('Debug', 'Exception in GetSystemRules: ', exp);
		return systemrulevalue;
	}	
}



function getSOLineDetailsNew2(sonumber,trantype,itemID,whLocation,lineid)
{
	nlapiLogExecution('DEBUG', 'sonumber,trantype,whLocation',sonumber+","+trantype+","+whLocation);

	var vType='SalesOrd';
	if(trantype=='salesorder')
		vType='SalesOrd';
	else if(trantype=='transferorder')
		vType='TrnfrOrd';
	// Check Intercompany Cross-Subsidiary fulfillment feature is enabled or not
	var crossSubsidiaryFeature=isIntercompanyCrossSubsidiaryFeatureEnabled();
	var filters = new Array();
	var columns = new Array();

	filters.push(new nlobjSearchFilter('internalid', null, 'anyof', sonumber));
	filters.push(new nlobjSearchFilter('type', null, 'anyof', vType));
	if(whLocation!=null && whLocation!='' && whLocation!='undefined' && whLocation!='null')
	{
		if(crossSubsidiaryFeature == true && trantype =='salesorder' )
		{
			//Will allow only locations for which WHsite falg is enabled,So no need to check again
			filters.push(new nlobjSearchFilter('inventorylocation', null, 'anyof', ['@NONE@',whLocation]));
		}
		else
		{
			filters.push(new nlobjSearchFilter('location', null, 'anyof', ['@NONE@',whLocation]));
		}

	}



	if(itemID != null && itemID != '' && itemID!='undefined' && itemID!='null')
		filters.push(new nlobjSearchFilter('item', null, 'anyof', itemID)); 

	if(lineid != null && lineid != '' && lineid!='undefined' && lineid!='null')
	{
		if(trantype=='transferorder')
			lineid = parseInt(lineid) + 1;
		//filters.push(new nlobjSearchFilter('line', 'custrecord_wmsse_line_no', 'anyof', lineid)); 
		filters.push(new nlobjSearchFilter('line', null, 'equalto', lineid));
	}

	var SOLineDetails = new nlapiSearchRecord('transaction', 'customsearch_wmsse_fulfil_ordline_detail', filters, columns);

	return SOLineDetails;
}

function onChange(type, name)
{
	if(trim(name)==trim('custpage_actqty'))
	{
		var currLine=nlapiGetCurrentLineItemIndex('custpage_packinglist');
		var quantity = nlapiGetLineItemValue('custpage_packinglist', 'custpage_actqty',currLine);
		var actQty=nlapiGetLineItemValue('custpage_packinglist', 'custpage_actqtyhddn', currLine);
		if(quantity != null && quantity != '')
		{
			var qtyValidate = quantity.split('.');
			if(qtyValidate.length > 1)
			{
				if(parseInt(qtyValidate[1].length) > 5)
				{
					alert('Quantity can not have more than 5 decimal places.');
					nlapiSetLineItemValue('custpage_packinglist', 'custpage_actqty', currLine,actQty);
					return false;
				}
			}
		}

	}

}
