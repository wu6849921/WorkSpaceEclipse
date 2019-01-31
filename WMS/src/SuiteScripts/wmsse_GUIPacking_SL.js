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
		
		var actualBeginTime = TimeStamp();
		
		
		var form = nlapiCreateForm('Packing');
		var soField = form.addField('custpage_order', 'text', 'Transaction #').setDisplaySize(15);
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
		//OrderType.addSelectOption("","");
		TranType.addSelectOption("salesorder","Sales Order");
		TranType.addSelectOption("transferorder","Transfer Order");
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
		if(request.getParameter('custpage_trantype')!='' && request.getParameter('custpage_trantype')!=null)
		{
			TranType.setDefaultValue(request.getParameter('custpage_trantype'));	
		}
		var OrderType = form.addField('custpage_ordertype', 'select', 'Order Type','customrecord_wmsse_ordertype').setDisplaySize(150);
		if(request.getParameter('custpage_ordertype')!='' && request.getParameter('custpage_ordertype')!=null)
		{
			OrderType.setDefaultValue(request.getParameter('custpage_ordertype'));	
		}
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
		var selectprintername=form.addField('custpage_printername', 'select', 'Printer Name');
		selectprintername.addSelectOption("","");

		
		var VactualBeginTime = form.addField('custpage_actualbegintime','text','Actual Begin Time').setDisplayType('hidden');
		VactualBeginTime.setDefaultValue(actualBeginTime);	
		
		
		
		//Retrieve all Work Stations
		var printernameList = getAllprinternames();

		// Add all Work Stations to workstation Field
		addAllPrinterNamesToField(form,selectprintername, printernameList);

		//var vProcessField= form.addField('custpage_process', 'text', '').setDisplayType('hidden');
		//vProcessField.setDefaultValue("F");
		form.addSubmitButton('Display');
		response.writePage(form);
	}
	else {
		var form = nlapiCreateForm('Packing');

		/*if(request.getParameter('custpage_process')=="F")
		{*/	
		nlapiLogExecution('ERROR', 'into', 'response');
		var msg = form.addField('custpage_message', 'inlinehtml', null, null, null).setLayoutType('outside','startrow');		  

		var Printer=request.getParameter('custpage_printername');
		//form.addSubmitButton('Submit');
		/*	var vProcessField= form.addField('custpage_process', 'text', '').setDisplayType('hidden');
			vProcessField.setDefaultValue("T");*/
		form.addButton('custpage_generatesearch','New Order','backtogeneratesearch()');
		form.setScript('customscript_wmsse_packing_cl');
		var SOarray = new Array();
		SOarray["custpage_order"]=request.getParameter('custpage_order');
		SOarray["custpage_trantype"]=request.getParameter('custpage_trantype');
		SOarray["custpage_printername"]=request.getParameter('custpage_printername');
		SOarray["custpage_actualbegintime"]=request.getParameter('custpage_actualbegintime');
		SOarray["custpage_qbwhlocation"]=request.getParameter('custpage_qbwhlocation');
		
		var actualBeginTime = request.getParameter('custpage_actualbegintime');
		
		
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
				form.setScript('customscript_wmsse_packing_cl');
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
				//form.addSubmitButton('Submit');
				var soField = form.addField('custpage_order', 'text', 'Transaction #').setDisplayType('inline');
				var TranType = form.addField('custpage_trantype', 'select', 'Transaction Type').setMandatory(true).setDisplaySize(150).setDisplayType('inline');//.setLayoutType('endrow','none').setDisplayType('inline');
				TranType.addSelectOption("","");
				TranType.addSelectOption("salesorder","Sales Order");
				TranType.addSelectOption("transferorder","Transfer Order");
				soField.setLayoutType('outside','none');
				
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
				if(request.getParameter('custpage_order')!='' && request.getParameter('custpage_order')!=null)
				{
					soField.setDefaultValue(request.getParameter('custpage_order'));	
				}
				var ShipMethod = form.addField('custpage_shipmethod', 'select', 'Ship Method').setDisplayType ("inline");
				ShipMethod.addSelectOption("","");
				if(request.getParameter('custpage_shipmethod')!='' && request.getParameter('custpage_shipmethod')!=null)
				{
					ShipMethod.setDefaultValue(request.getParameter('custpage_shipmethod'));	
				}
				var shipmethodResults = getShipmethods(null);
				
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
				VactualBeginTime.setDefaultValue(request.getParameter('custpage_actualbegintime'));	
				
				
				var getSOid=request.getParameter('custpage_order');

				var tranType =request.getParameter('custpage_trantype');
				nlapiLogExecution('DEBUG','tranType',tranType);
				nlapiLogExecution('DEBUG','getSOid',getSOid);
				var soid='';
				if(getSOid != '' && getSOid != null && getSOid != 'null' && getSOid != 'undefined')
					{
					var SOtrantypefilters=new Array();
					SOtrantypefilters.push(new nlobjSearchFilter('tranid',null,'is',getSOid));
					//SOtrantypefilters.push(new nlobjSearchFilter('mainline', null, 'is', 'F'));
					SOtrantypefilters.push(new nlobjSearchFilter('status', null, 'anyof', ['SalesOrd:B','SalesOrd:D','SalesOrd:E','TrnfrOrd:B','TrnfrOrd:D','TrnfrOrd:E']));
					SOtrantypefilters.push(new nlobjSearchFilter('shipping', null, 'is', 'F'));//To avoid shipping lines.
					SOtrantypefilters.push(new nlobjSearchFilter('taxline', null, 'is', 'F'));//To avoid tax lines.
				var SOtrantypecols=new Array();
				SOtrantypecols[0]=new nlobjSearchColumn('internalid');
				SOtrantypecols.push(new nlobjSearchColumn('shipgroup'));
				SOtrantypecols.push(new nlobjSearchColumn('shipmethod'));
				SOtrantypecols.push(new nlobjSearchColumn('line').setSort());
				if(blnMultiShipEnabled)
					SOtrantypecols.push(new nlobjSearchColumn('ismultishipto'));
					var SORecinternalids=nlapiSearchRecord(tranType,null,SOtrantypefilters,SOtrantypecols);
					
					if(SORecinternalids!=null && SORecinternalids!='')
					{
						soid = SORecinternalids[0].getValue('internalid');
						nlapiLogExecution('DEBUG','soid',soid);
						SOarray["custparam_trantype"] = tranType;
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
						nlapiLogExecution('DEBUG','opentaskSearchResults 4');
						msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', '"+st1+"', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
						response.writePage(form);
						return;
					}
					SORecinternalids=null;
				}
				
					
				

				var vType='SalesOrd';
				if(tranType=='salesorder')
					vType='SalesOrd';
				else if(tranType=='transferorder')
					vType='TrnfrOrd';
				
				var result = nlapiLoadSearch('customrecord_wmsse_trn_opentask','customsearch_wmsse_opentaskpackresults');
				
				var filters = new Array();
				result.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null,'anyof', ['8']));
				result.addFilter(new nlobjSearchFilter('custrecord_wmsse_act_end_date', null,'isnotempty'));
				result.addFilter(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null,'anyof',['@NONE@']));
				result.addFilter(new nlobjSearchFilter('custrecord_wmsse_actendloc', null,'isnotempty'));
			
				if(soid!=null && soid!='' && soid!='null')
				{
					result.addFilter(new nlobjSearchFilter('custrecord_wmsse_order_no', null,'anyof',soid));
					
				}
				result.addFilter(new nlobjSearchFilter('type','custrecord_wmsse_order_no', 'anyof',vType));
				result.addFilter(new nlobjSearchFilter('custrecord_wmsse_tasktype',null, 'anyof', ['3']));
				result.addFilter(new nlobjSearchFilter('type','custrecord_wmsse_sku', 'noneof', 'Kit'));
				result.addFilter(new nlobjSearchFilter('custrecord_wmsse_act_qty','null', 'isnotempty'));
				result.addFilter(new nlobjSearchFilter('mainline','custrecord_wmsse_order_no', 'is', 'T'));
			
				result.addFilter(new nlobjSearchFilter('status', 'custrecord_wmsse_order_no', 'anyof', ['SalesOrd:B','SalesOrd:D','SalesOrd:E','TrnfrOrd:B','TrnfrOrd:D','TrnfrOrd:E']));
				if(request.getParameter('custpage_shipmethod')!='' && request.getParameter('custpage_shipmethod')!=null && request.getParameter('custpage_shipmethod')!='null')
				{
					result.addFilter(new nlobjSearchFilter('custrecord_wmsse_shipmethod', null, 'anyof', request.getParameter('custpage_shipmethod')));
				}
				if(request.getParameter('custpage_ordertype')!='' && request.getParameter('custpage_ordertype')!=null && request.getParameter('custpage_ordertype')!='null')
				{
					result.addFilter(new nlobjSearchFilter('custrecord_wmsse_ord_type', null, 'anyof', request.getParameter('custpage_ordertype')));
				}
				if(request.getParameter('custpage_dept')!='' && request.getParameter('custpage_dept')!=null && request.getParameter('custpage_dept')!='null')
				{
					result.addFilter(new nlobjSearchFilter('custrecord_wmsse_dept', null, 'anyof', request.getParameter('custpage_dept')));
				}
				if(request.getParameter('custpage_class')!='' && request.getParameter('custpage_class')!=null && request.getParameter('custpage_class')!='null')
				{
					result.addFilter(new nlobjSearchFilter('custrecord_wmsse_classification', null, 'anyof', request.getParameter('custpage_class')));
				}
				if(request.getParameter('custpage_qbwhlocation')!='' && request.getParameter('custpage_qbwhlocation')!=null && request.getParameter('custpage_qbwhlocation')!='null')
				{
					result.addFilter(new nlobjSearchFilter('custrecord_wmsse_wms_location', null, 'anyof', request.getParameter('custpage_qbwhlocation')));
				}
				var columns=new Array();

				var opentaskSearchResults = new Array();
				
				var resLenDetails = result.runSearch();					
				
				var resultsPage = resLenDetails.getResults(0, 1000);
				var offset = 0;
				while (!!resultsPage && resultsPage.length > 0) 
				{
					opentaskSearchResults = opentaskSearchResults.concat(resultsPage);
					offset += 1000;
					resultsPage = resLenDetails.getResults(offset, offset + 1000);
				}				
				
				
				
				
				nlapiLogExecution('DEBUG','opentaskSearchResults',opentaskSearchResults);
				var whLoc = '';
				if(opentaskSearchResults != null && opentaskSearchResults != '' && opentaskSearchResults != 'null' && opentaskSearchResults != undefined && opentaskSearchResults.length>0)
				{							
					whLoc = opentaskSearchResults[0].getValue('custrecord_wmsse_wms_location',null,'group');

					var FULFILLMENTATORDERLEVEL=getSystemRuleValue('Consolidate item fulfillments by sales order?',whLoc);	


					var isRemainingQtyExists = 'F';

					if(FULFILLMENTATORDERLEVEL == 'Y')
					{
						var soLineDetails = getSOLineDetailsNew(getSOid,tranType,null,whLoc);
						

					
						if(soLineDetails !=null && soLineDetails!="")
						{
							var vLinecount=0;
							
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
								
								//var vOpentaskdetailspacking = getPickedqtydetails(soid,tranType,whLoc);
								
								for(var f=0;f<soLineDetails.length;f++)
								{

									var vsoitemRcvQty = soLineDetails[f].getValue('quantityshiprecv',null,'max');
									//var vsoitemCommitedQty=soLineDetails[f].getValue('quantitycommitted',null,'max');
									var vsoitemCommitedQty=soLineDetails[f].getValue(vColumnslist[commitedQtyIndex]);			 
									var vsoitemfulfillQty=soLineDetails[f].getValue(vColumnslist[fulfilledQtyIndex]);
									var vsoitemopentaskQty=soLineDetails[f].getValue(vColumnslist[totalPickedQtyIndex]);
									var vsoitemErpConfirmedQty=soLineDetails[f].getValue(vColumnslist[ERPConfirmedQty]);
									var vsoitemNSReceivedQty=soLineDetails[f].getValue(vColumnslist[totalNSPickedQtyIndex]);
									var vsoitemLine = soLineDetails[f].getValue('line',null,'group');
									var vsoitem = soLineDetails[f].getText('item',null,'group');
									var vsoitemId = soLineDetails[f].getValue('item',null,'group');
									if(tranType == 'transferorder' && vsoitemLine != null)
										vsoitemLine = parseInt(vsoitemLine)-1;
									


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

									var vsoitemPickedQty = parseFloat(vsoitemopentaskQty)+parseFloat(vsoitemErpConfirmedQty)+(parseFloat(vsoitemNSReceivedQty)-parseFloat(vsoitemErpConfirmedQty));
									var vsoitemQty = soLineDetails[f].getValue('quantity',null,'max');
									var vsoitemLine = soLineDetails[f].getValue('line',null,'group');

									var vsoitemRemQty=parseFloat(vsoitemCommitedQty)+ parseFloat(vsoitemfulfillQty) -parseFloat(vsoitemPickedQty);

									if(parseFloat(vsoitemRemQty)>0)
									{
										var isRemainingQtyExists = 'T';
										break;
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
							var sublist = form.addSubList("custpage_packinglist", "list", "Packing");
							sublist.addField("custpage_select", "checkbox", "Confirm").setDefaultValue('T');
							sublist.addField("custpage_orderinternalid", "text", "Order InternalId").setDisplayType('hidden');
							sublist.addField("custpage_ordernumber", "text", "Transaction #");
							sublist.addField("custpage_locationname", "text", "Location");
							sublist.addField("custpage_container", "text", "Container #");	
							sublist.addField("custpage_sku", "text", "SKU ");
							sublist.addField("custpage_skuinternalid", "text", "SKU InternalId").setDisplayType('hidden');
							sublist.addField("custpage_parentsku", "text", "SKU ").setDisplayType('hidden');
							sublist.addField("custpage_parentskuinternalid", "text", "SKU InternalId").setDisplayType('hidden');
							sublist.addField("custpage_locationhddn", "text", "Location").setDisplayType('hidden');
							sublist.addField("custpage_checkflaghddn", "checkbox", "checkFlag").setDisplayType('hidden');
							sublist.addField("custpage_lineno", "text", "Line No ");
							sublist.addField("custpage_actqty", "text", "Quantity").setDisplayType('entry').setDisplaySize(15);
							sublist.addField("custpage_units", "text", "Units").setDisplaySize(15);
							sublist.addField("custpage_actqtyhddn", "text", "Quantity").setDisplayType('hidden');
							sublist.addField("custpage_expqtyhddn", "text", "Exp Quantity").setDisplayType('hidden');
							sublist.addField("custpage_shipmethod", "text", "Ship Method Id").setDisplayType('hidden');
							sublist.addField("custpage_shipgroup", "text", "Ship group").setDisplayType('hidden');
							sublist.addField("custpage_shipmethodtext", "text", "Ship Method");
							sublist.addField("custpage_isremqtyexistsfororder", "text", "Rem Quantity").setDisplayType('hidden');
							sublist.addMarkAllButtons();

							for(var i=0;i<opentaskSearchResults.length;i++)
							{
								var count=parseInt(i)+1;
								BindSublist(form,opentaskSearchResults[i],count,getSOid,soid,Shiparray,i,isRemainingQtyExists);
							}
							opentaskSearchResults=null;
							filters=null;
							columns=null;
						}					
						else{

							msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', 'All the items in the order are packed/not yet picked.', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");	

							response.writePage(form);
						}

						SORec=null;
					/*}
					else
					{
						nlapiLogExecution('ERROR','opentaskSearchResults 4');
						msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', '"+st1+"', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
						response.writePage(form);
					}
					SORecinternalids=null;
				}
				else
				{
					nlapiLogExecution('ERROR','opentaskSearchResults ');
					msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', '"+st1+"', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
					response.writePage(form);
				}*/

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


function BindSublist(form,sublistData,sublistCount,Order,soInternalId,Shiparray,i,isRemainingQtyExists)
{
	try {
		var ActQuantity=sublistData.getValue('formulanumeric',null,'SUM');
		var ExpQuantity=sublistData.getValue('custrecord_wmsse_expe_qty',null,'SUM');
		var linenum=sublistData.getValue('custrecord_wmsse_line_no',null,'group');
		var	itemid=sublistData.getText('custrecord_wmsse_sku',null,'group');
		var	iteminternalid=sublistData.getValue('custrecord_wmsse_sku',null,'group');
		var	vContainer=sublistData.getValue('custrecord_wmsse_container_lp_no',null,'group');
		var vParentItemText = sublistData.getText('custrecord_wmsse_parent_sku_no',null,'group');
		var vParentItemInternalId = sublistData.getValue('custrecord_wmsse_parent_sku_no',null,'group');
		var vShipMethod = sublistData.getValue('custrecord_wmsse_shipmethod',null,'group');
		var vShipMethodText = sublistData.getText('custrecord_wmsse_shipmethod',null,'group');
		soInternalId = sublistData.getValue('internalid','custrecord_wmsse_order_no','group');
		Order =sublistData.getValue('tranid','custrecord_wmsse_order_no','group');
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
		form.getSubList('custpage_packinglist').setLineItemValue('custpage_shipmethod', sublistCount, 
				vShipMethod);
		form.getSubList('custpage_packinglist').setLineItemValue('custpage_shipmethodtext', sublistCount, 
				vShipMethodText);
		form.getSubList('custpage_packinglist').setLineItemValue('custpage_isremqtyexistsfororder', sublistCount, 
				isRemainingQtyExists);
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
		form.setScript('customscript_wmsse_packing_cl');
		var vNewCarton=request.getParameter('custpage_carton');
		var vNewCartonSize=request.getParameter('custpage_cartonsize');
		var vNewCartonWeight=request.getParameter('custpage_cartonweight');
		var vSoName=request.getParameter('custpage_order');
		var tranType =request.getParameter('custpage_trantype');
		
		var VactualBeginTime = request.getParameter('custpage_actualbegintime');
		nlapiLogExecution('DEBUG','VactualBeginTimepost',VactualBeginTime);
		
		var lineCount = request.getLineItemCount('custpage_packinglist');
		nlapiLogExecution('DEBUG','linecount', lineCount);
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
		var vShipMethod="";
		var vShipGroup="";
		var vShipMethodArr = new Array();
		var vShipGroupArr = new Array();
		var vlineArr = new Array();
		var linevalues='';
		var qtyvalues='';


		for(var v = 1; v <= lineCount; v++){
			var shipmethod= request.getLineItemValue('custpage_packinglist','custpage_shipmethod', v);
			var isRowSelected= request.getLineItemValue('custpage_packinglist', 'custpage_select', v);
			var shipgroup= request.getLineItemValue('custpage_packinglist','custpage_shipgroup', v);
			var soInternalId= request.getLineItemValue('custpage_packinglist', 'custpage_orderinternalid', v);
			var checkFlaghddn = request.getLineItemValue('custpage_packinglist','custpage_checkflaghddn',v);
			
			
			if(isRowSelected=="T" )
			{
				var lineNo = request.getLineItemValue('custpage_packinglist', 'custpage_lineno', v);
				vlineArr.push(lineNo);
				var vActqty = request.getLineItemValue('custpage_packinglist', 'custpage_actqty', v);
				
				if(linevalues!=null && linevalues!='')
				linevalues=linevalues + "," +lineNo;
				else
					linevalues=lineNo;
				
				if(qtyvalues!=null && qtyvalues!='')
					qtyvalues=qtyvalues + "," +vActqty;
					else
						qtyvalues=vActqty;
				
				
				
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

		if(vlineArr.length>50)
		{
			var param = new Array();
			nlapiLogExecution('ERROR','request', request);
			param['custscript_newcarton'] = vNewCarton;	
			param['custscript_newcartonsize'] = vNewCartonSize;
			param['custscript_newcartonweight'] = vNewCartonWeight;
			param['custscript_soname'] = vSoName;
			param['custscript_trantype'] = tranType;
			param['custscript_shipmethodarr'] = vShipMethodArr;
			param['custscript_shipgrouparr'] = vShipGroupArr;
			param['custscript_Sointernalid'] = soInternalId;
			param['custscript_linearr'] = linevalues;
			param['custscript_actualbegintime'] = VactualBeginTime;
			param['custscript_checkflag'] = checkFlaghddn;
			param['custscript_qtyvalues'] = qtyvalues;
			nlapiScheduleScript('customscript_wmsse_packing_sch', null,param);
			//To invoke Schedule script
			var currentUserID = getCurrentUser();//To get current user
			updateScheduleScriptStatus('Packing SCH',currentUserID,'Submitted',vSoName,tranType);

			var fulfillid = '';




			//form.addButton('custpage_generatesearch','New Order','backtogeneratesearch()');
			var vnform = nlapiCreateForm('Packing');

			var vnmsg = vnform.addField('custpage_message', 'inlinehtml', null, null, null).setLayoutType('outside','startrow');		  
			vnform.addButton('custpage_generatesearch','New Order','backtogeneratesearch()');
			vnform.setScript('customscript_wmsse_packing_cl');
			//var st1='Order  ' + vSoName + '  Packed successfully';
			var st1 = "SO/TO "+vSoName+" with containerlp(s) "+vNewCarton+" packed successfully";
			vnmsg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Confirmation', '"+st1+"', NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null, null, null);</script></div>");
			var htmlstring="";
			//htmlstring=Htmlparameters["strVar"];
			htmlstring="packing completed";
			//htmlstring=gethtmlstringbyLp(newContainerLpNo);
			nlapiLogExecution('ERROR', 'Htmlstring is:',htmlstring);		

			var temphtmlstring= vnform.addField('custpage_temphtmlstring', 'longtext', 'temphtmlstring').setDisplayType('hidden');
			temphtmlstring.setDefaultValue(htmlstring);			
			var temphtmlstring= vnform.addField('custpage_soid', 'text', 'soInternalId').setDisplayType('hidden');
			temphtmlstring.setDefaultValue(soInternalId);
			var tempcontlp= vnform.addField('custpage_contlp', 'text', 'contlp').setDisplayType('hidden');
			tempcontlp.setDefaultValue(vNewCarton);	
			var tempfulfillid = vnform.addField('custpage_fulfillment', 'text', 'Fulfillment Id').setDisplayType('hidden');
			tempfulfillid.setDefaultValue(fulfillid);

			vnform.addButton('custpage_print','Print Packlist','PrintPacklist('+whLoc+')');
			response.writePage(vnform);

		}
		else
		{
			var context = nlapiGetContext();		
			var currentUserID =  context.getUser();
			nlapiLogExecution('ERROR','currentUserID', currentUserID);
			var tempFlag="F";




			
			var kitTempFlag="F";
			var vPreviousParentItemId='';
			var vPreviousParentItemLineNO='';
			var vPrevSoId='';
			for(var s = 1; s <= lineCount; s++){
				var isRowSelected= request.getLineItemValue('custpage_packinglist', 'custpage_select', s);

			if(isRowSelected=="T" && vShipMethodArr.length <= 1 && vShipGroupArr.length <= 1)
			{

				var soName = request.getLineItemValue('custpage_packinglist', 'custpage_ordernumber', s);
				vSoName = soName;
				var soInternalId= request.getLineItemValue('custpage_packinglist', 'custpage_orderinternalid', s);
				var skuName = request.getLineItemValue('custpage_packinglist', 'custpage_sku', s);
				var skuInternalId = request.getLineItemValue('custpage_packinglist', 'custpage_skuinternalid', s);
				var lineNo = request.getLineItemValue('custpage_packinglist', 'custpage_lineno', s);
				var actQty = request.getLineItemValue('custpage_packinglist', 'custpage_actqty', s);
				var containerNo = request.getLineItemValue('custpage_packinglist', 'custpage_container', s);
				var actqtyHddn = request.getLineItemValue('custpage_packinglist','custpage_actqtyhddn',s);
				var locationhddn = request.getLineItemValue('custpage_packinglist','custpage_locationhddn',s);
				var checkFlaghddn = request.getLineItemValue('custpage_packinglist','custpage_checkflaghddn',s);
				var parentskuName = request.getLineItemValue('custpage_packinglist', 'custpage_parentsku', s);
				var parentskuInternalId = request.getLineItemValue('custpage_packinglist', 'custpage_parentskuinternalid', s);
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
						tempFlag="T";
						RecordId=opentaskSearchResults[z].getId();
						var tactQty = opentaskSearchResults[z].getValue('custrecord_wmsse_act_qty');
						var tSku  = opentaskSearchResults[z].getValue('custrecord_wmsse_sku');
						var tLine = opentaskSearchResults[z].getValue('custrecord_wmsse_line_no');
						whLoc= opentaskSearchResults[z].getValue('custrecord_wmsse_wms_location');
						var tSerialNums = opentaskSearchResults[z].getValue('custrecord_wmsse_serial_no');
						var tConversionRate = opentaskSearchResults[z].getValue('custrecord_wmsse_conversionrate');
						if(tConversionRate ==  '' || tConversionRate == 'null' || tConversionRate == null || tConversionRate == undefined || isNaN(tConversionRate))
						{
							tConversionRate = 1;
						}
						vCustomer= opentaskSearchResults[z].getValue('custrecord_wmsse_customer');
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
								Qty = parseFloat(parseFloat(curQty).toFixed(5));
								
								fields.push('custrecord_wmsse_act_qty');
								values.push(Number(Big(Qty).toFixed(5)));
								
								Qty = Number(Big(Qty).mul(tConversionRate));								
								//Qty = parseFloat((parseFloat(Qty)* parseFloat(tConversionRate)).toFixed(5));
								nlapiLogExecution('DEBUG', 'first', Qty);
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
								//createopentaskrec.setFieldValue('custrecord_wmsse_act_qty', parseFloat(remainQty).toFixed(5));
								//createopentaskrec.setFieldValue('custrecord_wmsse_expe_qty', parseFloat(remainQty).toFixed(5));
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
							
							curQty = Number(Big(curQty).minus(Qty));
							//curQty = parseFloat(curQty)-parseFloat(Qty);
						}

						
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
								var vMainItemQty =0;
								if(actqtyHddn != actQty)
								{
									vMainItemQty = fnGetKitItemQty(vparentItemId,actQty);
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
					/*if(parseFloat(actQty) !=  parseFloat(actqtyHddn) )
					{
						var remainQty = parseFloat(actqtyHddn)-parseFloat(actQty);
						var createopentaskrec =  nlapiCopyRecord('customrecord_wmsse_trn_opentask',RecordId);		    	
						nlapiLogExecution('ERROR', 'createopentaskrec', createopentaskrec);
						createopentaskrec.setFieldValue('custrecord_wmsse_wms_status_flag', '8');//Statusflag='C'
						createopentaskrec.setFieldValue('custrecord_wmsse_container_size', vNewCartonSize);	
						createopentaskrec.setFieldValue('custrecord_wmsse_container_lp_no', containerNo);	
						createopentaskrec.setFieldValue('custrecord_wmsse_act_qty', parseFloat(remainQty).toFixed(5));
						createopentaskrec.setFieldValue('custrecord_wmsse_expe_qty', parseFloat(remainQty).toFixed(5));
						createopentaskrec.setFieldValue('custrecord_wmsse_upd_user_no', currentUserID);
						createopentaskrec.setFieldValue('name',soName);
						createopentaskrec.setFieldValue('custrecord_wmsse_device_upload_flag','F');
						if(remSerialNums!=null && remSerialNums!='')
						{
							createopentaskrec.setFieldValue('custrecord_wmsse_serial_no', remSerialNums);
						}
						nlapiSubmitRecord(createopentaskrec);
						createopentaskrec=null;

					}*/
					opentaskSearchResults=null;
					remSerialNums=null;
					totalSerialArray=null;
				}
			}
		}
		if(vShipMethodArr.length > 1 || vShipGroupArr.length > 1)
		{
			var st1="Packing should be allowed for same ship method/shipping address";
			msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', '"+st1+"', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
			response.writePage(form);
		}
		else if(tempFlag=="T")
		{
			var isItLastPick="T";
			var FULFILLMENTATORDERLEVEL=getSystemRuleValue('Consolidate item fulfillments by sales order?',whLoc);
			if(FULFILLMENTATORDERLEVEL =='Y')
			{
					//var soLineDetails = getSOLineDetailsItemrefactor(vSoName,tranType,null,whLoc);
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

							//var vOpentaskdetails = getPickedqtydetails(vSoName,tranType,whLoc);
							for(var f=0;f<soLineDetails.length;f++)
							{

								var vsoitemRcvQty = soLineDetails[f].getValue('quantityshiprecv',null,'max');
								//var vsoitemCommitedQty=soLineDetails[f].getValue('quantitycommitted',null,'max');
								var vsoitemCommitedQty=soLineDetails[f].getValue(vColumnslist[commitedQtyIndex]);			 
								var vsoitemfulfillQty=soLineDetails[f].getValue(vColumnslist[fulfilledQtyIndex]);
								var vsoitemopentaskQty=soLineDetails[f].getValue(vColumnslist[totalPickedQtyIndex]);
								var vsoitemErpConfirmedQty=soLineDetails[f].getValue(vColumnslist[ERPConfirmedQty]);
								var vsoitemNSReceivedQty=soLineDetails[f].getValue(vColumnslist[totalNSPickedQtyIndex]);
								var vsoitemLine = soLineDetails[f].getValue('line',null,'group');
								var vsoitem = soLineDetails[f].getText('item',null,'group');
								var vsoitemId = soLineDetails[f].getValue('item',null,'group');
								if(tranType == 'transferorder' && vsoitemLine != null)
									vsoitemLine = parseInt(vsoitemLine)-1;
								

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
							
							nlapiLogExecution('DEBUG','vsoitemPickedQty',vsoitemPickedQty);

						
							var vsoitemQty = soLineDetails[f].getValue('quantity',null,'max');
							var vsoitemLine = soLineDetails[f].getValue('line',null,'group');
							
							
							vsoitemCommitedQty=Big(vsoitemCommitedQty);
							var vsoitemRemQty=Number(vsoitemCommitedQty.plus(vsoitemfulfillQty).minus(vsoitemPickedQty));
							
							//var vsoitemRemQty=parseFloat(vsoitemCommitedQty)+ parseFloat(vsoitemfulfillQty) -parseFloat(vsoitemPickedQty);
							nlapiLogExecution('Debug', 'vsoitemRemQty', vsoitemRemQty);
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
			// To post IF when order level is true and lastpick is true for already packed containers against order
		/*	if(FULFILLMENTATORDERLEVEL =='Y' && isItLastPick=="T")
			{
				var filtersPack = new Array();
				filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_wms_status_flag', null, 'anyof', ['28']));
				filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_nsconfirm_ref_no', null, 'anyof',['@NONE@'])); 
				filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_order_no', null, 'anyof', soInternalId));
				filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_tasktype', null, 'anyof', ['14']));
				if(vNewCarton!=null && vNewCarton!='' && vNewCarton != '- None -')
					filtersPack.push(new nlobjSearchFilter('custrecord_wmsse_container_lp_no', null, 'isnot', vNewCarton));

				var columnsPack=new Array();
				columnsPack[0]=new nlobjSearchColumn('custrecord_wmsse_device_upload_flag');
				var opentaskSearchResultsPack=nlapiSearchRecord('customrecord_wmsse_trn_opentask',null,filtersPack,columnsPack);
				if(opentaskSearchResultsPack!=null && opentaskSearchResultsPack!='')
				{
					nlapiLogExecution('ERROR','opentaskSearchResultsPack at',opentaskSearchResultsPack.length);
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
							nlapiLogExecution('ERROR','vPackRecId at',vPackRecId);
						}
					}
				}
			}*/
			// end
			var customrecord = nlapiCreateRecord('customrecord_wmsse_trn_opentask');

			if(vNewCarton!=null && vNewCarton!='')
				customrecord.setFieldValue('custrecord_wmsse_container_lp_no', vNewCarton);
			if(vNewCartonSize!=null && vNewCartonSize!='')	
				customrecord.setFieldValue('custrecord_wmsse_container_size', vNewCartonSize);
			if(vNewCartonWeight!=null && vNewCartonWeight!='')
				customrecord.setFieldValue('custrecord_wmsse_containerweight', vNewCartonWeight);

			customrecord.setFieldValue('custrecord_wmsse_wms_location', whLoc);
			customrecord.setFieldValue('custrecord_wmsse_order_no', soInternalId);

			customrecord.setFieldValue('custrecord_wmsse_wms_status_flag', 28);//Packing completed
			customrecord.setFieldValue('custrecord_wmsse_tasktype', 14);
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

			var vDate=DateStamp();
			var vTime=TimeStampNew();
			var vNewDate=vDate + ' ' + vTime;
			customrecord.setFieldValue('custrecord_wmsse_pack_comp_date', vNewDate);

			var VactualEndTime=TimeStamp();
			if(VactualBeginTime != null && VactualBeginTime != '')
			customrecord.setFieldValue('custrecord_wmsse_actualbegintime', VactualBeginTime);
			customrecord.setFieldValue('custrecord_wmsse_actualendtime', VactualEndTime);
			
			customrecord.setFieldValue('name', vSoName);
			var recid = nlapiSubmitRecord(customrecord);
			
			var fulfillid = '';
			
			customrecord=null;
			nlapiLogExecution('DEBUG', 'Item Fulfillment posted successfully',recid);
			
			//form.addButton('custpage_generatesearch','New Order','backtogeneratesearch()');
			var vnform = nlapiCreateForm('Packing');
			if(recid != null && recid != 'null' && recid != '')
			{
				var fulrecId=nlapiLoadRecord('customrecord_wmsse_trn_opentask',recid);
				fulfillid = fulrecId.getFieldValue('custrecord_wmsse_nsconfirm_ref_no');
			}
			nlapiLogExecution('DEBUG', 'fulfillid',fulfillid);
			var vnmsg = vnform.addField('custpage_message', 'inlinehtml', null, null, null).setLayoutType('outside','startrow');		  
			vnform.addButton('custpage_generatesearch','New Order','backtogeneratesearch()');
			vnform.setScript('customscript_wmsse_packing_cl');
			//var st1='Order  ' + vSoName + '  Packed successfully';
			var st1 = "SO/TO "+vSoName+" with containerlp(s) "+vNewCarton+" packed successfully";
			vnmsg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Confirmation', '"+st1+"', NLAlertDialog.TYPE_LOWEST_PRIORITY,  '100%', null, null, null);</script></div>");
			var htmlstring="";
			//htmlstring=Htmlparameters["strVar"];
			htmlstring="packing completed";
			//htmlstring=gethtmlstringbyLp(newContainerLpNo);
			nlapiLogExecution('DEBUG', 'Htmlstring is:',htmlstring);		

			var temphtmlstring= vnform.addField('custpage_temphtmlstring', 'longtext', 'temphtmlstring').setDisplayType('hidden');
			temphtmlstring.setDefaultValue(htmlstring);			
			var temphtmlstring= vnform.addField('custpage_soid', 'text', 'soInternalId').setDisplayType('hidden');
			temphtmlstring.setDefaultValue(soInternalId);
			var tempcontlp= vnform.addField('custpage_contlp', 'text', 'contlp').setDisplayType('hidden');
			tempcontlp.setDefaultValue(vNewCarton);	
			var tempfulfillid = vnform.addField('custpage_fulfillment', 'text', 'Fulfillment Id').setDisplayType('hidden');
			tempfulfillid.setDefaultValue(fulfillid);
			nlapiLogExecution('ERROR', 'temphtmlstring:',temphtmlstring);
			
			vnform.addButton('custpage_print','Print Packlist','PrintPacklist('+whLoc+')');
			response.writePage(vnform);

			}	

			else
			{
				//var st1="Please Select Atleast One Line Item.";
				var st1 = "All the items in the order are already packed/not yet picked.";
				nlapiLogExecution('DEBUG', 'No Line item Selected','');
				//form.addButton('custpage_generatesearch','New Order','backtogeneratesearch()');
				var errform = nlapiCreateForm('Packing');
				nlapiLogExecution('DEBUG', 'into', 'error');
				var msg = errform.addField('custpage_message', 'inlinehtml', null, null, null).setLayoutType('outside','startrow');	
				msg.setDefaultValue("<div id='div__alert' align='center'></div><script>showAlertBox('div__alert', 'Error', '"+st1+"', NLAlertDialog.TYPE_HIGH_PRIORITY,  '100%', null, null, null);</script></div>");
				errform.addButton('custpage_errgeneratesearch','New Order','backtogeneratesearch()');
				errform.setScript('customscript_wmsse_packing_cl');
				response.writePage(errform);
			}

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
	var PackingURL = nlapiResolveURL('SUITELET', 'customscript_wmsse_gui_packing', 'customdeploy_wmsse_gui_packing');

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

/*function updateOpentaskBulk(picktaskarr,newParent,id)
{	
	newParent.selectNewLineItem('recmachcustrecord_nswl_ot_parent');			
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent', 'id', picktaskarr.getId());
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','name', picktaskarr.getValue('name'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_act_begin_date', picktaskarr.getValue('custrecord_nswl_act_begin_date'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_act_end_date', DateStamp());
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_act_qty', picktaskarr.getValue('custrecord_nswl_act_qty'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_batch_no', picktaskarr.getValue('custrecord_nswl_batch_no'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_comp_id', picktaskarr.getValue('custrecord_nswl_comp_id'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_current_date', DateStamp());
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_container_lp_no', picktaskarr.getValue('custrecord_nswl_container_lp_no'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_sku', picktaskarr.getValue('custrecord_nswl_sku'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_skudesc', picktaskarr.getValue('custrecord_nswl_skudesc'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_expe_qty', picktaskarr.getValue('custrecord_nswl_expe_qty'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_line_no', picktaskarr.getValue('custrecord_nswl_line_no'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_wms_status_flag', picktaskarr.getValue('custrecord_nswl_wms_status_flag'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_tasktype', picktaskarr.getValue('custrecord_nswl_tasktype'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_totalcube',picktaskarr.getValue('custrecord_nswl_totalcube'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_total_weight', picktaskarr.getValue('custrecord_nswl_total_weight'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_upd_user_no', picktaskarr.getValue('custrecord_nswl_upd_user_no'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_actbeginloc', picktaskarr.getValue('custrecord_nswl_actbeginloc'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_actendloc', picktaskarr.getValue('custrecord_nswl_actendloc'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_expirydate', picktaskarr.getValue('custrecord_nswl_expirydate'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_fifodate', picktaskarr.getValue('custrecord_nswl_fifodate'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_order_no', picktaskarr.getValue('custrecord_nswl_order_no'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_wms_location', picktaskarr.getValue('custrecord_nswl_wms_location'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_put_strategy', picktaskarr.getValue('custrecord_nswl_put_strategy'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_pick_strategy', picktaskarr.getValue('custrecord_nswl_pick_strategy'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_zone_no', picktaskarr.getValue('custrecord_nswl_zone_no'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_parent_sku_no', picktaskarr.getValue('custrecord_nswl_parent_sku_no'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_nsconfirm_ref_no', id);
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_ot_parent','custrecord_nswl_report_no', picktaskarr.getValue('custrecord_nswl_report_no'));
	newParent.commitLineItem('recmachcustrecord_nswl_ot_parent');
	nlapiSubmitRecord(newParent); 

	nlapiLogExecution('Debug', 'Time Stamp at the end of Update Opentask Bulk','');
}

function UpdateSerialEntry(rec,newParent)
{
	newParent.selectNewLineItem('recmachcustrecord_nswl_st_parent');
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_st_parent', 'id', rec.getId());
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_st_parent','name', rec.getValue('custrecord_nswl_ser_no'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_st_parent','custrecord_nswl_ser_ordno', rec.getValue('custrecord_nswl_ser_ordno'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_st_parent','custrecord_nswl_ser_item', rec.getValue('custrecord_nswl_ser_item'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_st_parent','custrecord_nswl_ser_ordline', rec.getValue('custrecord_nswl_ser_ordline'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_st_parent','custrecord_nswl_ser_qty', rec.getValue('custrecord_nswl_ser_qty'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_st_parent','custrecord_nswl_ser_no', rec.getValue('custrecord_nswl_ser_no'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_st_parent','custrecord_nswl_ser_status', 'T');
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_st_parent','custrecord_nswl_ser_note1', rec.getValue('custrecord_nswl_ser_note1'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_st_parent','custrecord_nswl_ser_location', rec.getValue('custrecord_nswl_ser_location'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_st_parent','custrecord_nswl_ser_tasktype', rec.getValue('custrecord_nswl_ser_tasktype'));
	newParent.setCurrentLineItemValue('recmachcustrecord_nswl_st_parent','custrecord_nswl_ser_bin', rec.getValue('custrecord_nswl_ser_bin'));
	newParent.commitLineItem('recmachcustrecord_nswl_st_parent');	
}
 */
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