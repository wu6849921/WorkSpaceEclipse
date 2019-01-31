/***************************************************************************
 Copyright � 2015,2018, Oracle and/or its affiliates. All rights reserved.
 ****************************************************************************/

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function fnInventoryReport(request, response)
{
	if (request.getMethod() == 'GET')
	{
		var form = nlapiCreateForm('Inventory Report');


		createInventoryReportForm(request, form, false);


		response.writePage(form);

	} 
	else 
	{

		try
		{
			var form = nlapiCreateForm("Inventory Report");
			var inventoryStatusFeature = isInvStatusFeatureEnabled();

			createInventoryReportForm(request, form, true);
			var filters = new Array();
			var vLocation= request.getParameter('custpage_location');
			var vItem= request.getParameter('custpage_item');
			var vBinLoc= request.getParameter('custpage_binloc');
			var vInvStatus= request.getParameter('custpage_invstatus');

			// If Inventory Status feature is enabled
			if(inventoryStatusFeature == true)
			{
				var vItemWiseInvDetails = [];			
				var result=nlapiLoadSearch('InventoryBalance', 'customsearch_wmsse_inv_report_invbnew');
				if(vLocation==null || vLocation=='')
				var vLocation = getRoledBasedLocation();
				
				if(vLocation != null && vLocation != '')
					result.addFilter(new nlobjSearchFilter('location', null, 'anyof', vLocation));
				if(vItem != null && vItem != '')
					result.addFilter(new nlobjSearchFilter('item', null, 'anyof', vItem));
				if(vBinLoc != null && vBinLoc != '')
					result.addFilter(new nlobjSearchFilter('binnumber', null, 'anyof', vBinLoc));
				if(vInvStatus != null && vInvStatus != '')
					result.addFilter(new nlobjSearchFilter('status', null, 'anyof', vInvStatus));

				var resLen = result.runSearch();
				var srhIterator = 0;
				var resultSet = resLen.forEachResult(function(searchResult)
						{
					srhIterator++;
					vItemWiseInvDetails.push(searchResult);
					if(parseFloat(srhIterator) == 4000)
					{
						return false;
					}
					return true;                // return true to keep iterating
						});



				var sumqtyonHand = 0;
				var sumavailqty = 0;
				var index=1;
				addSublistToForm(form);
				if(vItemWiseInvDetails!=null && vItemWiseInvDetails!='')
				{
					// Fetch Inventory Balance based Item status
					nlapiLogExecution('DEBUG', 'vItemWiseInvDetails length',vItemWiseInvDetails.length);
					for(var invStatusItr=0;invStatusItr<vItemWiseInvDetails.length;invStatusItr++)
					{	
						var searchresult=vItemWiseInvDetails[invStatusItr];

						var strItemName = searchresult.getText('item',null,'group');  
						var itemid = searchresult.getValue('item',null,'group'); 
						nlapiLogExecution('DEBUG', 'itemid',itemid);
						var strBin = searchresult.getText('binnumber',null,'group');
						var strBinId = searchresult.getValue('binnumber',null,'group');
						var strLocation = searchresult.getText('location',null,'group');
						var strLocationId = searchresult.getValue('location',null,'group');
						var strOnhandQty = searchresult.getValue('onhand',null,'sum');
						var strAvailQty = searchresult.getValue('available',null,'sum');
						var blnIsLotItem = searchresult.getValue('islotitem','item','group');
						var blnIsSerialItem = searchresult.getValue('isserialitem','item','group');
						var strItemDesc = searchresult.getValue('description','item','group');
						var invStatus = searchresult.getText('status',null,'group');
						var invStatusId = searchresult.getValue('status',null,'group');

						nlapiLogExecution('DEBUG', 'desc length',strItemDesc);
						nlapiLogExecution('DEBUG', 'name length',strItemName);
						nlapiLogExecution('DEBUG', 'loc length',strLocation);
						if(strItemDesc != null && strItemDesc != '' && strItemDesc !='null' && strItemDesc != '- None -')
							form.getSubList('custpage_items').setLineItemValue('custpage_skudesc', invStatusItr+1, strItemDesc);
						if(strItemName != null && strItemName != '' && strItemName !='null' && strItemName != '- None -')
							form.getSubList('custpage_items').setLineItemValue('custpage_sku', invStatusItr+1, strItemName);
						if(strLocation != null && strLocation != '' && strLocation !='null' && strLocation != '- None -')
							form.getSubList('custpage_items').setLineItemValue('custpage_whloc', invStatusItr+1, strLocation);
						var vItemType='INV';
						if(blnIsLotItem != null && blnIsLotItem != '' && blnIsLotItem == 'T')
							vItemType='LOT';
						if(blnIsSerialItem != null && blnIsSerialItem != '' && blnIsSerialItem == 'T')
							vItemType='SERIAL';
						nlapiLogExecution('DEBUG', 'blnIsLotItem',blnIsLotItem);
						nlapiLogExecution('DEBUG', 'blnIsSerialItem',blnIsSerialItem);

						nlapiLogExecution('DEBUG', 'vItemType',vItemType);
						var vStockUnits = "";
						if(searchresult.getText('stockunit','item','group') != null && searchresult.getText('stockunit','item','group') != '')
							vStockUnits=searchresult.getText('stockunit','item','group');

						var vBinOpenTaskDetails=new Array();
						nlapiLogExecution('DEBUG', 'invStatusId',invStatusId);
						vBinOpenTaskDetails = getOPenTaskPickBinDetails(itemid,strBinId,strLocationId,searchresult.getValue('unitstype','item','group'),
								searchresult.getText('stockunit','item','group'),"",invStatusId);
						nlapiLogExecution('DEBUG', 'vBinOpenTaskDetails.length',vBinOpenTaskDetails.length);
						var vOpenPickQty=0;
						var vBinOpenTaskBinQtyArr = "";
						if(vBinOpenTaskDetails!=null && vBinOpenTaskDetails !='' && vBinOpenTaskDetails.length >0)
						{
							vBinOpenTaskBinQtyArr = vBinOpenTaskDetails[1];
							vOpenPickQty = vBinOpenTaskBinQtyArr[0];
						}
						if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
							vOpenPickQty =0;

						strAvailQty = parseFloat(strAvailQty)-parseFloat(vOpenPickQty);
						strAvailQty = parseFloat(parseFloat(strAvailQty).toFixed(5));
						strOnhandQty = parseFloat(parseFloat(strOnhandQty).toFixed(5));
						if(parseFloat(strAvailQty) < 0)
							strAvailQty = 0;

						if(strBin != null && strBin != '' && strBin !='null' && strBin != '- None -')
						{
							if(vItemType == 'LOT' || vItemType == 'SERIAL')					
							{	
								var strBinURL = nlapiResolveURL('SUITELET', 'customscript_wmsse_inv_report_serials', 'customdeploy_wmsse_inv_report_ser_dl') 
								+ "&custpage_item=" + itemid+ "&custpage_location=" + strLocationId+ "&custpage_binloc=" + strBinId+ "&custpage_itemtype=" 
								+ vItemType+ "&custpage_invstatus=" + invStatusId;				
								form.getSubList('custpage_items').setLineItemValue('custpage_binloc', invStatusItr+1, 
										"<a href='"+strBinURL+"' target='_blank'>"+strBin+"</a>");
							}
							else
							{
								form.getSubList('custpage_items').setLineItemValue('custpage_binloc', invStatusItr+1,strBin);
							}	
						}
						if(vStockUnits != null && vStockUnits != '' && vStockUnits !='null' && vStockUnits != '- None -')
							form.getSubList('custpage_items').setLineItemValue('custpage_units', invStatusItr+1,vStockUnits);

						form.getSubList('custpage_items').setLineItemValue('custpage_qtyonhand', invStatusItr+1, 
								"<span style='float: right;'>"+strOnhandQty.toString()+"</span>");
						form.getSubList('custpage_items').setLineItemValue('custpage_availqty', invStatusItr+1,
								"<span style='float: right;'>"+strAvailQty.toString()+"</span>");
						if(inventoryStatusFeature == true)
							form.getSubList('custpage_items').setLineItemValue('custpage_invstatus', invStatusItr+1,
									"<span style='float: right;'>"+invStatus.toString()+"</span>");


						sumavailqty = parseFloat(sumavailqty) + parseFloat(strAvailQty);

						if(strOnhandQty=="")
							strOnhandQty=0;
						sumqtyonHand = parseFloat(sumqtyonHand) + parseFloat(strOnhandQty);
						index=parseFloat(index+1);

					}
				}

			}
			else
			{
				if(vLocation==null || vLocation=='')
					var vLocation = getRoledBasedLocation();
				
				if(vLocation != null && vLocation != '')
					filters.push(new nlobjSearchFilter('location', 'binonhand', 'anyof', vLocation));
				if(vItem != null && vItem != '')
					filters.push(new nlobjSearchFilter('internalid', null, 'anyof', vItem));
				if(vBinLoc != null && vBinLoc != '')
					filters.push(new nlobjSearchFilter('binnumber', 'binonhand', 'anyof', vBinLoc));


				var vItemWiseInvDetails=nlapiSearchRecord('item', 'customsearch_wmsse_itemwise_inv_report', filters, null);
				nlapiLogExecution('DEBUG', 'Inventory report Post');
				var sumqtyonHand = 0;
				var sumavailqty = 0;
				var index=1;
				addSublistToForm(form);
				if(vItemWiseInvDetails!=null && vItemWiseInvDetails!='')
				{ 
					nlapiLogExecution('DEBUG', 'vItemWiseInvDetails length',vItemWiseInvDetails.length);
					for(var i=0;i<vItemWiseInvDetails.length;i++)
					{	
						var searchresult=vItemWiseInvDetails[i];
						var strItemName = searchresult.getValue('itemid');  
						var itemid = searchresult.getId();
						nlapiLogExecution('DEBUG', 'itemid',itemid);

						var strBin = searchresult.getText('binnumber','binOnHand');
						var strBinId = searchresult.getValue('binnumber','binOnHand');
						var strLocation = searchresult.getText('location','binOnHand');
						var strLocationId = searchresult.getValue('location','binOnHand');
						var strOnhandQty = searchresult.getValue('quantityonhand','binOnHand');
						var strAvailQty = searchresult.getValue('quantityavailable','binOnHand');
						nlapiLogExecution('DEBUG', 'strOnhandQty',strOnhandQty);
						nlapiLogExecution('DEBUG', 'strAvailQty',strAvailQty);
						var blnIsLotItem = searchresult.getValue('islotitem');
						var blnIsSerialItem = searchresult.getValue('isserialitem');
						var strItemDesc = searchresult.getValue('description');
						form.getSubList('custpage_items').setLineItemValue('custpage_skudesc', i+1, strItemDesc);
						form.getSubList('custpage_items').setLineItemValue('custpage_sku', i+1, strItemName);
						form.getSubList('custpage_items').setLineItemValue('custpage_whloc', i+1, strLocation);
						var vItemType='INV';
						if(blnIsLotItem != null && blnIsLotItem != '' && blnIsLotItem == 'T')
							vItemType='LOT';
						if(blnIsSerialItem != null && blnIsSerialItem != '' && blnIsSerialItem == 'T')
							vItemType='SERIAL';
						nlapiLogExecution('DEBUG', 'blnIsLotItem',blnIsLotItem);
						nlapiLogExecution('DEBUG', 'blnIsSerialItem',blnIsSerialItem);

						nlapiLogExecution('DEBUG', 'vItemType',vItemType);
						var vStockUnits = "";
						if(searchresult.getText('stockunit') != null && searchresult.getText('stockunit') != '')
							vStockUnits=searchresult.getText('stockunit');

						var vBinOpenTaskDetails=new Array();

						vBinOpenTaskDetails = getOPenTaskPickBinDetails(itemid,strBinId,strLocationId,
								searchresult.getValue('unitstype'),searchresult.getText('stockunit'));
						var vOpenPickQty=0;
						var vBinOpenTaskBinQtyArr = "";
						if(vBinOpenTaskDetails!=null && vBinOpenTaskDetails !='' && vBinOpenTaskDetails.length >0)
						{
							vBinOpenTaskBinQtyArr = vBinOpenTaskDetails[1];
							vOpenPickQty = vBinOpenTaskBinQtyArr[0];
						}
						if(vOpenPickQty == null || vOpenPickQty == '' || vOpenPickQty =='null' || vOpenPickQty == '- None -')
							vOpenPickQty =0;
						nlapiLogExecution('DEBUG', 'vOpenPickQty',vOpenPickQty); 
						nlapiLogExecution('DEBUG', 'strAvailQty',strAvailQty); 
						strAvailQty = parseFloat(strAvailQty)-parseFloat(vOpenPickQty);
						strAvailQty = parseFloat(parseFloat(strAvailQty).toFixed(5));
						strOnhandQty = parseFloat(parseFloat(strOnhandQty).toFixed(5));
						if(parseFloat(strAvailQty) < 0)
							strAvailQty = 0;
						if(vItemType == 'LOT' || vItemType == 'SERIAL')					
						{	
							var strBinURL = nlapiResolveURL('SUITELET', 'customscript_wmsse_inv_report_serials',
							'customdeploy_wmsse_inv_report_ser_dl') + "&custpage_item=" + itemid+ "&custpage_location=" 
							+ strLocationId+ "&custpage_binloc=" + strBinId+ "&custpage_itemtype=" + vItemType;				
							form.getSubList('custpage_items').setLineItemValue('custpage_binloc', i+1, 
									"<a href='"+strBinURL+"' target='_blank'>"+strBin+"</a>");
						}
						else
						{
							form.getSubList('custpage_items').setLineItemValue('custpage_binloc', i+1,strBin);
						}	
						if(vStockUnits != null && vStockUnits != '')
							form.getSubList('custpage_items').setLineItemValue('custpage_units', i+1,vStockUnits);

						form.getSubList('custpage_items').setLineItemValue('custpage_qtyonhand', i+1, 
								"<span style='float: right;'>"+strOnhandQty.toString()+"</span>");
						form.getSubList('custpage_items').setLineItemValue('custpage_availqty', i+1,
								"<span style='float: right;'>"+strAvailQty.toString()+"</span>");

						sumavailqty = parseFloat(sumavailqty) + parseFloat(strAvailQty);

						if(strOnhandQty=="")
							strOnhandQty=0;
						sumqtyonHand = parseFloat(sumqtyonHand) + parseFloat(strOnhandQty);
						index=parseFloat(index+1);

					}
				}
			}
			sumavailqty = parseFloat(parseFloat(sumavailqty).toFixed(5));
			sumqtyonHand = parseFloat(parseFloat(sumqtyonHand).toFixed(5));
			form.getSubList('custpage_items').setLineItemValue('custpage_binloc', index, 'Total');    	
			form.getSubList('custpage_items').setLineItemValue('custpage_qtyonhand', index, "<span style='float: right;'>"+sumqtyonHand.toString()+"</span>");   
			form.getSubList('custpage_items').setLineItemValue('custpage_availqty', index, "<span style='float: right;'>"+sumavailqty.toString()+"</span>");

			form.setScript('customscript_wmsse_inv_report');	
			form.addButton('custpage_excel','Export to excel','fnInvReportExport()');

		}
		catch(e)
		{
			nlapiLogExecution('ERROR', 'Exception in Inventory Report', e.toString());

		}

		response.writePage(form);
	}
}

function fnInvReportExport()
{
	var fullfillment=null;
	var InvPDFURL = nlapiResolveURL('SUITELET', 'customscript_wmsse_inv_report_excel', 'customdeploy_wmsse_inv_report_excel_dl');

	var vLocation= nlapiGetFieldValue('custpage_location');
	var vItem= nlapiGetFieldValue('custpage_item');
	var vBinLoc= nlapiGetFieldValue('custpage_binloc'); 
	var lineCnt = nlapiGetLineItemCount('custpage_items'); 

	var invstatus = nlapiGetFieldValue('custpage_invstatus');

	if(lineCnt == -1 || lineCnt == 0)
	{
		alert('No records available to export to excel');
		return false;
	}
	InvPDFURL = InvPDFURL + '&custpage_location='+ vLocation+'&custpage_item='+ vItem+'&custpage_binloc='+ vBinLoc+"&custpage_invstatus="+ invstatus;
	window.open(InvPDFURL);
}

function createInventoryReportForm(request, form, subListIndicator)
{
	// Item
	var inventoryStatusFeature = isInvStatusFeatureEnabled();
	var objItem = form.addField('custpage_item', 'select', 'Item', 'Item');
	var objLocation = form.addField('custpage_location', 'select', 'Location');
	objLocation.addSelectOption("","");
	var objBins = form.addField('custpage_binloc', 'select', 'Bin Location', 'bin'); 
	var itemStatus="";
	if(inventoryStatusFeature == true)
	{
		itemStatus = form.addField('custpage_invstatus', 'select', 'Inventory Status');
		itemStatus.addSelectOption("","");
	}
	var sOptionsArr = new Array();
	
	nlapiLogExecution('DEBUG', 'inventoryStatusFeature',inventoryStatusFeature);
	
	
	if(inventoryStatusFeature == true)
	{
		
		var itemstatusdropdown = getInventoryStatusListForOutBound(-1);
		if(itemstatusdropdown != null && itemstatusdropdown != '' && itemstatusdropdown != 'null' && itemstatusdropdown != 'undefined' && itemstatusdropdown != undefined)
		{


			for ( var itrsts = 0; itemstatusdropdown != null && itrsts < itemstatusdropdown.length; itrsts++ )
			{
				var res = itemstatusdropdown[itrsts];
				var listValue = (res[0]);
				var listID = (res[1]);
				var row1=[listID,listValue];
				sOptionsArr.push(row1);

			} 
		}
		if(sOptionsArr != null && sOptionsArr != '' && sOptionsArr != 'null')
		{
			for (var statuscount = 0; sOptionsArr != null && statuscount < sOptionsArr.length; statuscount++) 
			{
				var val = sOptionsArr[statuscount][0];
				var StatusText =sOptionsArr[statuscount][1];
			
				if(itemstatusdropdown[statuscount][1] != null && itemstatusdropdown[statuscount][1] != "" && itemstatusdropdown[statuscount][1] != " ")
				{
					var invStatus = form.getField('custpage_invstatus').getSelectOptions(itemstatusdropdown[statuscount][1], 'is');
					if (invStatus != null) 
					{
						if (invStatus.length > 0) 
						{
							continue;
						}
					}
					itemStatus.addSelectOption(itemstatusdropdown[statuscount][1], itemstatusdropdown[statuscount][0]);
				}
			}
		}		
	}


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
		for (var j = 0; roleBasedLocationArray != null && j < roleBasedLocationArray.length; j++) 
		{
			if(roleBasedLocationArray[j][0] != null && roleBasedLocationArray[j][0] != "" && roleBasedLocationArray[j][0] != " ")
			{
				var tslocation = form.getField('custpage_location').getSelectOptions(roleBasedLocationArray[j][0], 'is');
				if (tslocation != null) 
				{
					if (tslocation.length > 0) 
					{
						continue;
					}
				}
				objLocation.addSelectOption(roleBasedLocationArray[j][0], roleBasedLocationArray[j][1]);
			}
		}
	}
	//Setting location value as default if the subsidiary have only one location.
	if(vRolebasedLocation.length==1)
	{
		objLocation.setDefaultValue(vRolebasedLocation[0]);	
	}

	if (request.getMethod() == 'POST')
	{ 

		if(request.getParameter('custpage_location')!=null)
		{
			objLocation.setDefaultValue(request.getParameter('custpage_location'));
		}
		if(request.getParameter('custpage_item')!=null)
		{
			objItem.setDefaultValue(request.getParameter('custpage_item'));
		}

		if(request.getParameter('custpage_binloc')!=null)
		{
			objBins.setDefaultValue(request.getParameter('custpage_binloc'));
		}
		if(request.getParameter('custpage_invstatus')!=null)
		{
			itemStatus.setDefaultValue(request.getParameter('custpage_invstatus'));
		}

	}

	var button = form.addSubmitButton('Display');

}

function addSublistToForm(form)
{
	var inventoryStatusFeature = isInvStatusFeatureEnabled();
	var sublist = form.addSubList("custpage_items", "list", "Inventory Report");

	sublist.addField("custpage_sku", "text", "item");

	sublist.addField("custpage_skudesc", "textarea", "Item Desc");
	sublist.addField("custpage_whloc", "text", "Location"); 
	sublist.addField("custpage_binloc", "text", "Bin Location");
	sublist.addField("custpage_units", "text", "Units");
	sublist.addField("custpage_qtyonhand", "text", '<span style="float: right;"> Quantity On Hand </span>');
	sublist.addField("custpage_availqty", "text", '<span style="float: right;">Avail Qty </span>');
	if(inventoryStatusFeature == true)
	{
		sublist.addField("custpage_invstatus", "text", '<span style="float: right;">Inventory Status </span>');
	}
}

function getLocationName(vRoleLocation)
{
	var locationArray=new Array();

	nlapiLogExecution('DEBUG', 'vRoleLocation', vRoleLocation);
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

